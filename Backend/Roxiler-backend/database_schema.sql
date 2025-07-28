-- Create database
CREATE DATABASE IF NOT EXISTS store_rating_db;
USE store_rating_db;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'normal_user', 'store_owner') NOT NULL DEFAULT 'normal_user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_name_length CHECK (CHAR_LENGTH(name) >= 20 AND CHAR_LENGTH(name) <= 60),
    CONSTRAINT chk_address_length CHECK (CHAR_LENGTH(address) <= 400)
);

-- Stores table
CREATE TABLE stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_store_name_length CHECK (CHAR_LENGTH(name) >= 20 AND CHAR_LENGTH(name) <= 60),
    CONSTRAINT chk_store_address_length CHECK (CHAR_LENGTH(address) <= 400)
);

-- Ratings table
CREATE TABLE ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    rating INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5),
    
    -- Unique constraint to prevent duplicate ratings from same user for same store
    UNIQUE KEY unique_user_store_rating (user_id, store_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_name ON users(name);

CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_stores_email ON stores(email);
CREATE INDEX idx_stores_owner_id ON stores(owner_id);

CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_store_id ON ratings(store_id);
CREATE INDEX idx_ratings_rating ON ratings(rating);

-- Insert default admin user (password: Admin@123)
INSERT INTO users (name, email, address, password, role) VALUES 
('System Administrator Account', 'admin@storerating.com', '123 Admin Street, Admin City, Admin State 12345', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert sample store owners and stores
INSERT INTO users (name, email, address, password, role) VALUES 
('John Smith Store Manager Owner', 'john@electronics.com', '456 Electronics Ave, Tech City, State 67890', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'store_owner'),
('Sarah Johnson Grocery Store Owner', 'sarah@grocery.com', '789 Food Street, Market City, State 54321', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'store_owner');

INSERT INTO stores (name, email, address, owner_id) VALUES 
('Tech Electronics Superstore Chain', 'john@electronics.com', '456 Electronics Ave, Tech City, State 67890', 2),
('Fresh Grocery Market And Supplies', 'sarah@grocery.com', '789 Food Street, Market City, State 54321', 3);

-- Insert sample normal users
INSERT INTO users (name, email, address, password, role) VALUES 
('Mike Wilson Customer Account User', 'mike@email.com', '321 Customer Lane, User City, State 98765', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'normal_user'),
('Lisa Brown Regular Customer User', 'lisa@email.com', '654 Buyer Street, Customer City, State 13579', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'normal_user');

-- Insert sample ratings
INSERT INTO ratings (user_id, store_id, rating) VALUES 
(4, 1, 5),  -- Mike rates Tech Electronics: 5
(4, 2, 4),  -- Mike rates Fresh Grocery: 4
(5, 1, 3),  -- Lisa rates Tech Electronics: 3
(5, 2, 5);  -- Lisa rates Fresh Grocery: 5

-- Display table structures
DESCRIBE users;
DESCRIBE stores;
DESCRIBE ratings;