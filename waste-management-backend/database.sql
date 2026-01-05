-- Users Table
CREATE TABLE IF NOT EXISTS users (
  userId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  passwordHash VARCHAR(255),
  role ENUM('user','driver','admin') NOT NULL,
  address VARCHAR(255),
  profilePhotoUrl VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastLoginAt TIMESTAMP,
  isActive TINYINT(1) DEFAULT 1
);

-- Test Users (hash 'password123' with bcrypt)
INSERT INTO users (name, email, phone, passwordHash, role, address) 
VALUES 
('Admin User', 'admin@test.com', '0550000001', '$2b$10$nle00P4PAub5n0bDmT2KdOQabgHmydkVZUereS6JkYuNrtr6xa6MG', 'admin', 'Admin Office'),
('John Driver', 'driver@test.com', '0550000002', '$2b$10$nle00P4PAub5n0bDmT2KdOQabgHmydkVZUereS6JkYuNrtr6xa6MG', 'driver', 'Driver Base'),
('Jane Resident', 'user@test.com', '0550000003', '$2b$10$nle00P4PAub5n0bDmT2KdOQabgHmydkVZUereS6JkYuNrtr6xa6MG', 'user', '123 Main Street');

-- Additional Tables (expand as needed)
CREATE TABLE IF NOT EXISTS collection_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  truck_id INT,
  status ENUM('pending', 'in_progress', 'completed'),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  user_id INT PRIMARY KEY,
  license_number VARCHAR(50),
  truck_id INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(userId) ON DELETE CASCADE
);