CREATE DATABASE IF NOT EXISTS PerfumeShopDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE PerfumeShopDB;

-- Tạo 2 bảng cơ bản trước để test
CREATE TABLE Categories (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL
);

CREATE TABLE Products (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(255) NOT NULL,
    CategoryID INT,
    Price DECIMAL(18, 2) NOT NULL,
    ImageURL VARCHAR(255),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- Thêm dữ liệu mẫu
INSERT INTO Categories (CategoryName) VALUES ('Nước hoa Nữ'), ('Unisex');
INSERT INTO Products (ProductName, CategoryID, Price, ImageURL) 
VALUES ('Diptyque Eau Rose', 1, 4200000, 'https://images.unsplash.com/photo-1543460350-c13c01b33017');