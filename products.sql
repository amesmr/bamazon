CREATE DATABASE Bamazon;

USE Bamazon;

CREATE TABLE bamazon.products (
    item_id INT AUTO_INCREMENT NULL,
    product_name VARCHAR(100),
    department_name VARCHAR(300),
    price DECIMAL(8,2),
    stock_quantity INT,
    product_sales DECIMAL(8,2) DEFAULT 0.00,
    PRIMARY KEY (item_id)
);
	
   
INSERT INTO `bamazon`.`products` (`item_id`, `product_name`, `department_name`, `price`, `stock_quantity`) VALUES 
('0', 'cat litter', 'pets', '10.99', '50'),
('1', 'computer mouse', 'electronics', '25.99', '50'),
('2', 'laundry detergent', 'home', '8.99', '50'),
('3', 'laptop', 'electronics', '999.99', '50'),
('4', 'iPad', 'electronics', '599.00', '50'),
('5', 'puppy', 'pets', '20.00', '1');

CREATE TABLE bamazon.product_sales (
    department_id INT AUTO_INCREMENT NULL,
    department_name VARCHAR(100),
    over_head_costs DECIMAL(8,2),
    PRIMARY KEY (department_id)
);

INSERT INTO `bamazon`.`product_sales` ( `department_name`, `over_head_costs`) VALUES 
('pets', '1000.00'),
('electronics', '10000.00'),
('home', '5000.00');

   