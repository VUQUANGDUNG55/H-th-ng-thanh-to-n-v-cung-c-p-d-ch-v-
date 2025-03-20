CREATE DATABASE payment_system;
USE payment_system;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role ENUM('user', 'admin') DEFAULT 'user'
);

CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user VARCHAR(50) NOT NULL,
    service VARCHAR(100) NOT NULL,
    amount INT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
