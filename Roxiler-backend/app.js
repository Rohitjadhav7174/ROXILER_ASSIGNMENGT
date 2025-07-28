const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_rating_db'
};

let db;

async function initDatabase() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    
    if (users.length === 0) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

// Validation functions
const validateName = (name) => name && name.length >=4 && name.length <= 60;
const validateAddress = (address) => address && address.length <= 400;
const validatePassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
  return password && regex.test(password);
};
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email && regex.test(email);
};

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  console.log('Received registration data:', req.body);
  try {
    const { name, email, address, password } = req.body;

    // Validation
    if (!validateName(name)) {
      return res.status(400).json({ message: 'Name must be between 20-60 characters' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!validateAddress(address)) {
      return res.status(400).json({ message: 'Address must be max 400 characters' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be 8-16 characters with uppercase and special character' });
    }

    // Check if user exists
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, address, hashedPassword, 'normal_user']
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// USER ROUTES
app.put('/api/users/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ message: 'Password must be 8-16 characters with uppercase and special character' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, req.user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ADMIN ROUTES
app.get('/api/admin/dashboard', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
    const [storeCount] = await db.execute('SELECT COUNT(*) as count FROM stores');
    const [ratingCount] = await db.execute('SELECT COUNT(*) as count FROM ratings');

    res.json({
      totalUsers: userCount[0].count,
      totalStores: storeCount[0].count,
      totalRatings: ratingCount[0].count
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/admin/users', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    // Validation
    if (!validateName(name) || !validateEmail(email) || !validateAddress(address) || !validatePassword(password)) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    if (!['admin', 'normal_user', 'store_owner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user exists
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, address, hashedPassword, role]
    );

    // If store owner, create store entry
    if (role === 'store_owner') {
      await db.execute(
        'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
        [name, email, address, result.insertId]
      );
    }

    res.status(201).json({ message: 'User added successfully', userId: result.insertId });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/admin/stores', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, email, address, ownerName, ownerPassword } = req.body;

    // Validation
    if (!validateName(name) || !validateEmail(email) || !validateAddress(address)) {
      return res.status(400).json({ message: 'Invalid store data' });
    }

    if (!validateName(ownerName) || !validatePassword(ownerPassword)) {
      return res.status(400).json({ message: 'Invalid owner data' });
    }

    // Create owner user first
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);
    const [ownerResult] = await db.execute(
      'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)',
      [ownerName, email, address, hashedPassword, 'store_owner']
    );

    // Create store
    const [storeResult] = await db.execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, ownerResult.insertId]
    );

    res.status(201).json({ message: 'Store added successfully', storeId: storeResult.insertId });
  } catch (error) {
    console.error('Add store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/admin/users', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { sortBy = 'name', sortOrder = 'ASC', name, email, address, role } = req.query;
    
    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role,
             COALESCE(AVG(r.rating), 0) as rating
      FROM users u 
      LEFT JOIN stores s ON u.id = s.owner_id 
      LEFT JOIN ratings r ON s.id = r.store_id 
      WHERE 1=1
    `;
    const params = [];

    // Apply filters
    if (name) {
      query += ' AND u.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND u.email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND u.address LIKE ?';
      params.push(`%${address}%`);
    }
    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }

    query += ` GROUP BY u.id ORDER BY u.${sortBy} ${sortOrder}`;

    const [users] = await db.execute(query, params);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/admin/stores', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { sortBy = 'name', sortOrder = 'ASC', name, email, address } = req.query;
    
    let query = `
      SELECT s.id, s.name, s.email, s.address, 
             COALESCE(AVG(r.rating), 0) as rating,
             COUNT(r.id) as total_ratings
      FROM stores s 
      LEFT JOIN ratings r ON s.id = r.store_id 
      WHERE 1=1
    `;
    const params = [];

    // Apply filters
    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND s.email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    query += ` GROUP BY s.id ORDER BY s.${sortBy} ${sortOrder}`;

    const [stores] = await db.execute(query, params);
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// NORMAL USER ROUTES
// STORES ENDPOINT - Fixed and enhanced
app.get('/api/stores', authenticateToken, authorize(['normal_user']), async (req, res) => {

  try {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    // Validate sortBy to prevent SQL injection
    const validSortColumns = ['name', 'address', 'rating'];
    if (!validSortColumns.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sort column'
      });
    }

    // Validate sortOrder
    if (!['ASC', 'DESC'].includes(sortOrder.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sort order'
      });
    }

    let query = `
      SELECT 
        s.id, 
        s.name, 
        s.address, 
        COALESCE(AVG(r.rating), 0) as overall_rating,
        MAX(CASE WHEN ur.user_id = ? THEN ur.rating ELSE NULL END) as user_rating
      FROM stores s 
      LEFT JOIN ratings r ON s.id = r.store_id 
      LEFT JOIN ratings ur ON s.id = ur.store_id
      WHERE 1=1
    `;
    const params = [req.user.id];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    query += ` GROUP BY s.id ORDER BY ${sortBy} ${sortOrder}`;

    const [stores] = await db.execute(query, params);
    res.json({
      success: true,
      data: stores
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stores',
      error: error.message
    });
  }
});



// Replace the ratings endpoint with this corrected version:
app.post('/api/ratings', authenticateToken, async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!storeId || isNaN(storeId)) {
      return res.status(400).json({ success: false, message: 'Invalid store ID' });
    }

    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Start transaction
    await db.beginTransaction();

    try {
      // Verify store exists
      const [stores] = await db.execute('SELECT id FROM stores WHERE id = ?', [storeId]);
      if (stores.length === 0) {
        throw { status: 404, message: 'Store not found' };
      }

      // Check for existing rating
      const [existingRatings] = await db.execute(
        'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
        [userId, storeId]
      );

      // Update or create rating
      if (existingRatings.length > 0) {
        await db.execute(
          'UPDATE ratings SET rating = ?, updated_at = NOW() WHERE id = ?',
          [rating, existingRatings[0].id]
        );
      } else {
        await db.execute(
          'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
          [userId, storeId, rating]
        );
      }

     
      const [avgResult] = await db.execute(
        'SELECT AVG(rating) as average FROM ratings WHERE store_id = ?',
        [storeId]
      );

      await db.commit();

      res.json({
        success: true,
        message: 'Rating submitted successfully!',
        averageRating: parseFloat(avgResult[0].average).toFixed(1),
        userRating: rating
      });

    } catch (error) {
      await db.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Rating submission error:', error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to submit rating'
    });
  }
});

// STORE OWNER ROUTES
app.get('/api/store-owner/dashboard', authenticateToken, authorize(['store_owner']), async (req, res) => {
  try {
    // Get store owned by this user
    const [stores] = await db.execute('SELECT * FROM stores WHERE owner_id = ?', [req.user.id]);
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const store = stores[0];

    // Get average rating
    const [avgRating] = await db.execute(
      'SELECT COALESCE(AVG(rating), 0) as average_rating FROM ratings WHERE store_id = ?',
      [store.id]
    );

    // Get users who rated the store
    const [ratingUsers] = await db.execute(
      `
      SELECT u.name, u.email, r.rating, r.created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [store.id]);

    res.json({
      store: store,
      averageRating: avgRating[0].average_rating,
      ratingUsers: ratingUsers
    });
  } catch (error) {
    console.error('Store owner dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Example for Express.js
app.get('/api/stores', (req, res) => {
  let results = STORES;
  if (req.query.name) {
    results = results.filter(store => store.name.toLowerCase().includes(req.query.name.toLowerCase()));
  }
  if (req.query.address) {
    results = results.filter(store => store.address.toLowerCase().includes(req.query.address.toLowerCase()));
  }
  res.json(results);
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  // If authentication passed, return user info
  const { id, name, email, role } = req.user;
  res.json({ id, name, email, role });
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;