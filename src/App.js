// App.js
import React, { useState, useEffect, createContext, useContext,setSuccess,setCurrentView } from 'react';
import './App.css';

// Context for authentication
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// API service
const API_BASE = 'http://localhost:5001/api';

const api = {
  // Auth endpoints
  register: (data) => fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  login: (data) => fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // User endpoints
  updatePassword: (data, token) => fetch(`${API_BASE}/users/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }),

  // Admin endpoints
  getDashboard: (token) => fetch(`${API_BASE}/admin/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  
  getUsers: (token, params = '') => fetch(`${API_BASE}/admin/users?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  
  getAdminStores: (token, params = '') => fetch(`${API_BASE}/admin/stores?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  
 addUser: (data, token) => fetch(`${API_BASE}/admin/users`, {
  method: 'POST',
  headers: {  
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // Ensure this is correct
  },
  body: JSON.stringify(data)
}),
  
  addStore: (data, token) => fetch(`${API_BASE}/admin/stores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }),

  // Normal user endpoints
  getStores: (token, params = '') => fetch(`${API_BASE}/stores?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  
  submitRating: (data, token) => fetch(`${API_BASE}/ratings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }),

  // Store owner endpoints
  getOwnerDashboard: (token) => fetch(`${API_BASE}/store-owner/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
};

// Login Component
const Login = ({ setCurrentView }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.login(formData);
      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="auth-container">
  <form onSubmit={handleSubmit} className="auth-form">
    <h2>Login</h2>
    {error && <div className="error">{error}</div>}
    
    <input
      type="email"
      placeholder="Email"
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      required
    />
    
    <input
      type="password"
      placeholder="Password"
      value={formData.password}
      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      required
    />
    
    <button type="submit" disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>

    {/* Add this below the button */}
    <p style={{ marginTop: '12px', textAlign: 'center' }}>
      Don't have an account?{' '}
      <span
        style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
        onClick={() => setCurrentView('register')}
      >
        Register
      </span>
    </p>
  </form>
</div>


  );
};

// Register Component
const Register = ({ setCurrentView }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.register(formData);
      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        setFormData({ name: '', email: '', address: '', password: '' });
        
        // Delay for UX to let user read message, then switch
        setTimeout(() => {
          setCurrentView('login');
        }, 1500); // 1.5 seconds delay before switching to login
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Register</h2>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <input
          type="text"
          placeholder="Full Name (20-60 characters)"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        
        <textarea
          placeholder="Address (max 400 characters)"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          required
        />
        
        <input
          type="password"
          placeholder="Password (8-16 chars, uppercase + special char)"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

// Header Component
const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <h1>Store Rating System</h1>
      <div className="header-user">
        <span>Welcome, {user.name} ({user.role})</span>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </header>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userForm, setUserForm] = useState({
    name: '', email: '', address: '', password: '', role: 'normal_user'
  });
  const [storeForm, setStoreForm] = useState({
    name: '', email: '', address: '', ownerName: '', ownerPassword: ''
  });
  const [filters, setFilters] = useState({});
  const { token } = useAuth();
const [sortField, setSortField] = useState('');
const [sortOrder, setSortOrder] = useState('asc'); // or 'desc'
  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSort = (field) => {
  if (sortField === field) {
    // toggle order
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  } else {
    setSortField(field);
    setSortOrder('asc');
  }
};

useEffect(() => {
  loadUsers();
  // eslint-disable-next-line
}, [activeTab, filters, sortField, sortOrder]);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'stores') loadStores();
  }, [activeTab, filters]);

  

  const loadDashboardData = async () => {
    try {
      const response = await api.getDashboard(token);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

const loadUsers = async () => {
  try {
    const paramsObj = { ...filters };
    if (sortField) {
      paramsObj.sortField = sortField;
      paramsObj.sortOrder = sortOrder;
    }
    const params = new URLSearchParams(paramsObj).toString();
    const response = await api.getUsers(token, params);
    const data = await response.json();
    setUsers(data);
  } catch (err) {
    console.error('Error loading users:', err);
  }
};

  const loadStores = async () => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.getAdminStores(token, params);
      const data = await response.json();
      setStores(data);
    } catch (err) {
      console.error('Error loading stores:', err);
    }
  };

  const handleAddUser = async (e) => {
  e.preventDefault();
  try {
    const response = await api.addUser(userForm, token); // Make sure token is passed
    if (response.ok) {
      alert('User added successfully');
      setUserForm({ name: '', email: '', address: '', password: '', role: 'normal_user' });
      loadUsers();
    } else {
      const data = await response.json();
      alert(data.message);
    }
  } catch (err) {
    alert('Error adding user');
  }
};

const handleAddStore = async (e) => {
  e.preventDefault();
  try {
    const response = await api.addStore(storeForm, token); // Make sure token is passed
    if (response.ok) {
      alert('Store added successfully');
      setStoreForm({ name: '', email: '', address: '', ownerName: '', ownerPassword: '' });
      loadStores();
    } else {
      const data = await response.json();
      alert(data.message);
    }
  } catch (err) {
    alert('Error adding store');
  }
};
  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={activeTab === 'stores' ? 'active' : ''}
          onClick={() => setActiveTab('stores')}
        >
          Stores
        </button>
      </nav>

      {activeTab === 'dashboard' && stats && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Stores</h3>
            <p>{stats.totalStores}</p>
          </div>
          <div className="stat-card">
            <h3>Total Ratings</h3>
            <p>{stats.totalRatings}</p>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-section">
          <div className="section-header">
            <h3>Users Management</h3>
            <button onClick={() => setActiveTab('add-user')} className="add-btn">
              Add User
            </button>
          </div>
          
          <div className="filters">
            <input
              placeholder="Filter by name"
              onChange={(e) => setFilters({...filters, name: e.target.value})}
            />
            <input
              placeholder="Filter by email"
              onChange={(e) => setFilters({...filters, email: e.target.value})}
            />
            <select onChange={(e) => setFilters({...filters, role: e.target.value})}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="normal_user">Normal User</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>

          <table className="data-table">
  <thead>
  <tr>
    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
      Name
      {sortField === 'name' && (
        <span style={{ marginLeft: 4 }}>
          {sortOrder === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </th>
    <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
      Email
      {sortField === 'email' && (
        <span style={{ marginLeft: 4 }}>
          {sortOrder === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </th>
    <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>
      Role
      {sortField === 'role' && (
        <span style={{ marginLeft: 4 }}>
          {sortOrder === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </th>
    <th onClick={() => handleSort('rating')} style={{ cursor: 'pointer' }}>
      Rating
      {sortField === 'rating' && (
        <span style={{ marginLeft: 4 }}>
          {sortOrder === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </th>
  </tr>
</thead>


            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{Number(user.rating).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'stores' && (
        <div className="stores-section">
          <div className="section-header">
            <h3>Stores Management</h3>
            <button onClick={() => setActiveTab('add-store')} className="add-btn">
              Add Store
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Rating</th>
                <th>Total Ratings</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(store => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.email}</td>
                  <td>{store.address}</td>
                  <td>{Number(store.rating).toFixed(1)}</td>
                  <td>{store.total_ratings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
{activeTab === 'add-user' && (
  <div className="add-form-section">
    <div className="add-user-box">  
      <h3>Add New User</h3>
      <form onSubmit={handleAddUser} className="add-form">
        <input
          placeholder="Full Name"
          value={userForm.name}
          onChange={(e) => setUserForm({...userForm, name: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={userForm.email}
          onChange={(e) => setUserForm({...userForm, email: e.target.value})}
          required
        />
        <textarea
          placeholder="Address"
          value={userForm.address}
          onChange={(e) => setUserForm({...userForm, address: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={userForm.password}
          onChange={(e) => setUserForm({...userForm, password: e.target.value})}
          required
        />
        <select
          value={userForm.role}
          onChange={(e) => setUserForm({...userForm, role: e.target.value})}
        >
          <option value="normal_user">Normal User</option>
          <option value="store_owner">Store Owner</option>
          <option value="admin">Admin</option>
        </select>
        <div className="form-actions">
          <button type="submit">Add User</button>
          <button type="button" onClick={() => setActiveTab('users')}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}


      {activeTab === 'add-store' && (
        <div className="add-form-section">
          <h3>Add New Store</h3>
          <form onSubmit={handleAddStore} className="add-form">
            <input
              placeholder="Store Name"
              value={storeForm.name}
              onChange={(e) => setStoreForm({...storeForm, name: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Store Email"
              value={storeForm.email}
              onChange={(e) => setStoreForm({...storeForm, email: e.target.value})}
              required
            />
            <textarea
              placeholder="Store Address"
              value={storeForm.address}
              onChange={(e) => setStoreForm({...storeForm, address: e.target.value})}
              required
            />
            <input
              placeholder="Owner Name"
              value={storeForm.ownerName}
              onChange={(e) => setStoreForm({...storeForm, ownerName: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Owner Password"
              value={storeForm.ownerPassword}
              onChange={(e) => setStoreForm({...storeForm, ownerPassword: e.target.value})}
              required
            />
            <div className="form-actions">
              <button type="submit">Add Store</button>
              <button type="button" onClick={() => setActiveTab('stores')}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Normal User Dashboard (your updated full functional code)
const NormalUserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();
  const [filters, setFilters] = useState({ name: '', address: '' });
const [debouncedFilters, setDebouncedFilters] = useState(filters);

const [successMessage, setSuccessMessage] = useState('');
useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedFilters(filters);
  }, 500); // 500ms debounce delay

  return () => {
    clearTimeout(handler); // cleanup if filters changes before timeout
  };
}, [filters]);

useEffect(() => {
  loadStores();
  // eslint-disable-next-line
}, [debouncedFilters]);


const loadStores = async () => {
  try {
    setLoading(true);
    setError(null);

    const effectiveFilters = {};
    Object.keys(debouncedFilters).forEach(key => {
      if (debouncedFilters[key]) effectiveFilters[key] = debouncedFilters[key];
    });

    const params = new URLSearchParams(effectiveFilters).toString();
    const response = await api.getStores(token, params);

    if (!response.ok) {
      throw new Error('Failed to fetch stores');
    }

    const data = await response.json();

    let storesArray = Array.isArray(data)
      ? data
      : (Array.isArray(data.data) ? data.data : []);
    setStores(storesArray);
  } catch (err) {
    console.error('Error loading stores:', err);
    setError(err.message || 'Failed to load stores');
  } finally {
    setLoading(false);
  }
};



const handleRating = async (storeId, rating) => {
  try {
    const response = await api.submitRating({ storeId, rating }, token);
    const data = await response.json();

    if (response.ok) {
      setSuccessMessage('Rating submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000); // Hide after 3 seconds
      
      // Update the UI with the new rating
      setStores(prevStores => 
        prevStores.map(store => 
          store.id === storeId 
            ? { ...store, user_rating: rating, overall_rating: data.averageRating } 
            : store
        )
      );
    } else {
      throw new Error(data.message || 'Failed to submit rating');
    }
  } catch (error) {
    console.error('Rating submission failed:', error);
    if (error.message.includes('Failed to fetch')) {
      alert('Backend server is not responding. Please check: \n1. Backend is running\n2. Correct port (5001)\n3. No firewall blocking');
    } else {
      alert(error.message);
    }
  }
};

  const StarRating = ({ storeId, currentRating }) => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${currentRating >= star ? 'filled' : ''}`}
          onClick={() => handleRating(storeId, star)}
          style={{ cursor: 'pointer' }}
        >
          ★
        </span>
      ))}
    </div>
  );

  if (loading) {
    return <div className="loading">Loading stores...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="user-dashboard">
      <h2>Rate Stores</h2>
      <div className="filters">
       <input
  type="text"
  placeholder="Search by store name"
  value={filters.name || ''}
  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
/>
<input
  type="text"
  placeholder="Search by address"
  value={filters.address || ''}
  onChange={(e) => setFilters({ ...filters, address: e.target.value })}
/>


    
      </div>
      <div className="stores-list">
        {stores.length === 0 ? (
          <p>No stores found matching your criteria.</p>
        ) : (
          stores.map((store) => (
            <div key={store.id} className="store-card">
              <div className="store-info">
                <h3>{store.name}</h3>
                <p className="store-address">{store.address}</p>
                <p className="store-rating">
                  Overall Rating: {store.overall_rating ? Number(store.overall_rating).toFixed(1) : 'N/A'}
                </p>
              </div>
              <div className="rating-section">
                <p>Your Rating:</p>
                <StarRating 
                  storeId={store.id} 
                  currentRating={store.user_rating || 0} 
                />
                {store.user_rating && (
                  <p className="current-rating">
                    (Currently: {store.user_rating} stars)
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Store Owner Dashboard
const StoreOwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.getOwnerDashboard(token);
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  if (!dashboardData) return <div>Loading...</div>;

  return (
    <div className="owner-dashboard">
      <h2>Store Dashboard</h2>
      
      <div className="store-info">
        <h3>{dashboardData.store.name}</h3>
        <p>{dashboardData.store.address}</p>
        <p>Email: {dashboardData.store.email}</p>
        <h4>Average Rating: {Number(dashboardData.averageRating).toFixed(1)}/5</h4>
      </div>

      <div className="ratings-section">
        <h3>Customer Ratings</h3>
        {dashboardData.ratingUsers.length === 0 ? (
          <p>No ratings yet</p>
        ) : (
          <table className="ratings-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.ratingUsers.map((rating, index) => (
                <tr key={index}>
                  <td>{rating.name}</td>
                  <td>{rating.email}</td>
                  <td>{rating.rating}/5</td>
                  <td>{new Date(rating.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Password Change Component
const PasswordChange = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.updatePassword(formData, token);
      const data = await response.json();

      if (response.ok) {
        setSuccess('Password updated successfully');
        setFormData({ currentPassword: '', newPassword: '' });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  return (
    <div className="password-change">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit} className="password-form">
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <input
          type="password"
          placeholder="Current Password"
          value={formData.currentPassword}
          onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
          required
        />
        
        <input
          type="password"
          placeholder="New Password"
          value={formData.newPassword}
          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
          required
        />
        
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};

// Main App Component
 const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState('login');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentView('dashboard'); 
    } else {
      setCurrentView('login');
    }
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setCurrentView('dashboard'); 
  };


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setCurrentView('login');
  };

  const authValue = { user, token, login, logout };

  if (!user) {
    return (
      <AuthContext.Provider value={authValue}>
        <div className="app">
          <div className="auth-header">
            <h1>Store Rating System</h1>
         
          </div>
{currentView === 'login' ? <Login setCurrentView={setCurrentView} /> : <Register setCurrentView={setCurrentView} />}
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <div className="app">
        <Header />
      <main className="main-content-with-sidebar">
  <aside className="sidebar">
    <ul>
      <li
        className={currentView === 'dashboard' ? 'active' : ''}
        onClick={() => setCurrentView('dashboard')}
      >
        Dashboard
      </li>
      <li
        className={currentView === 'password' ? 'active' : ''}
        onClick={() => setCurrentView('password')}
      >
        Change Password
      </li>
    </ul>
  </aside>
  <section className="main-section">
    {currentView === 'dashboard' && user.role === 'admin' && <AdminDashboard />}
    {currentView === 'dashboard' && user.role === 'normal_user' && <NormalUserDashboard />}
    {currentView === 'dashboard' && user.role === 'store_owner' && <StoreOwnerDashboard />}
    {currentView === 'password' && <PasswordChange />}
  </section>
</main>

      </div>
    </AuthContext.Provider>
  );
};

export default App;