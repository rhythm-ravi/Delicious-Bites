CREATE DATABASE prodb;
use prodb;


-- drop database prodb;
-- consider on delete cascade for foreign keys esp for customers

# User profile details
CREATE TABLE customers (	# Customer records stored in this table
	id INT AUTO_INCREMENT,
    username VARCHAR(15) NOT NULL,
    first_name VARCHAR(15) NOT NULL,
    last_name VARCHAR(15),
    mobile VARCHAR(15) NOT NULL,		# varchar so that to maybe allow country codes?
    email_id VARCHAR(40) NOT NULL,
    password VARCHAR(255) NOT NULL,		# hashed password
    
    CONSTRAINT chk_username CHECK ( username REGEXP '^[A-Za-z][a-zA-Z0-9_]{2,14}$' ),       # username must start with a letter, and consist of 3-15 chars
    CONSTRAINT chk_mobile CHECK ( mobile REGEXP '^[0-9]{5}[0-9]{5}$' ),
    CONSTRAINT chk_email CHECK ( email_id REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' ),
    CONSTRAINT chk_password CHECK ( CHAR_LENGTH(password) >= 8 ),
    PRIMARY KEY (id),
    UNIQUE KEY (username),
    UNIQUE KEY (mobile),
    UNIQUE KEY (email_id)
);

# States table for addresses
CREATE TABLE states (
    state_name VARCHAR(30) PRIMARY KEY
);
INSERT INTO states (state_name) VALUES
('Andhra Pradesh'), ('Arunachal Pradesh'), ('Assam'), ('Bihar'), ('Chhattisgarh'),
('Goa'), ('Gujarat'), ('Haryana'), ('Himachal Pradesh'), ('Jharkhand'),
('Karnataka'), ('Kerala'), ('Madhya Pradesh'), ('Maharashtra'), ('Manipur'),
('Meghalaya'), ('Mizoram'), ('Nagaland'), ('Odisha'), ('Punjab'),
('Rajasthan'), ('Sikkim'), ('Tamil Nadu'), ('Telangana'), ('Tripura'),
('Uttar Pradesh'), ('Uttarakhand'), ('West Bengal'),
('Andaman and Nicobar Islands'), ('Chandigarh'), ('Dadra and Nagar Haveli and Daman and Diu'),
('Delhi'), ('Jammu and Kashmir'), ('Ladakh'), ('Lakshadweep'), ('Puducherry');

# Created delivery addresses
CREATE TABLE addresses (
	id INT PRIMARY KEY AUTO_INCREMENT, 
	cust_id INT NOT NULL,
    name VARCHAR(25),
    address1 VARCHAR(100) NOT NULL,		# line 1 (flat, house number, ...)
    address2 VARCHAR(100),		# line 2 ( area, street, sector, ...)
    landmark VARCHAR(25),		
    postal_code CHAR(6) NOT NULL CHECK (postal_code REGEXP '^[0-9]{6}$'),
    state VARCHAR(30) NOT NULL,
    
    FOREIGN KEY (cust_id) REFERENCES customers(id),
    FOREIGN KEY (state) REFERENCES states(state_name)
);
# Trigger to ensure no more than 5 addresses per customer
DELIMITER //
CREATE TRIGGER limit_address_count
BEFORE INSERT ON addresses
FOR EACH ROW
BEGIN
  DECLARE address_count INT;
  SELECT COUNT(*) INTO address_count FROM addresses WHERE cust_id = NEW.cust_id;
  IF address_count >= 5 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Address limit reached for this customer';
  END IF;
END;
//
DELIMITER ;


-- MENU VERSIONING
CREATE TABLE menu (
    id INT PRIMARY KEY DEFAULT 1,                 -- only one row needed
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO menu (id) VALUES (1);
CREATE TABLE items (	# Items available at the restaurant 
	id INT AUTO_INCREMENT,
    code VARCHAR(4),	# item code, could be used to locate url
    name VARCHAR(30) NOT NULL,
    price DECIMAL(10,2),
    availability BOOL DEFAULT true,
    item_desc VARCHAR(100),	# string descriptions for each item
    img_url VARCHAR(50),	# url for locating corresponnding thumbnail relative to the directory containing scripts accessing them
    is_deprecated BOOL DEFAULT false,
    
    PRIMARY KEY (id),
    UNIQUE KEY (code),
    UNIQUE KEY (name)
);


-- USER CART VERSIONING
CREATE TABLE carts (
    cust_id INT,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (cust_id),
    FOREIGN KEY (cust_id) REFERENCES customers(id)
);
CREATE TABLE cart_entries(
	item_id INT,
    cust_id INT,
	qty INT NOT NULL,

    PRIMARY KEY (cust_id, item_id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (cust_id) REFERENCES carts(cust_id)
);

DELIMITER //
-- CART CREATION TRIGGER
CREATE TRIGGER create_cart_row_after_insert
AFTER INSERT ON customers
FOR EACH ROW
BEGIN
    INSERT INTO carts (cust_id) VALUES (NEW.cust_id);
END;
//

-- MENU TIMESTAMP TRIGGERS
CREATE TRIGGER items_after_insert
AFTER INSERT ON items
FOR EACH ROW
BEGIN
    UPDATE menu SET last_updated = CURRENT_TIMESTAMP WHERE id = 1;
END;
//

CREATE TRIGGER items_after_update
AFTER UPDATE ON items
FOR EACH ROW
BEGIN
    UPDATE menu SET last_updated = CURRENT_TIMESTAMP WHERE id = 1;
END;
//

CREATE TRIGGER items_after_delete
AFTER DELETE ON items
FOR EACH ROW
BEGIN
    UPDATE menu SET last_updated = CURRENT_TIMESTAMP WHERE id = 1;
END;
//

-- CART TIMESTAMP TRIGGERS
CREATE TRIGGER cart_entries_after_insert
AFTER INSERT ON cart_entries
FOR EACH ROW
BEGIN
    UPDATE carts SET last_updated = CURRENT_TIMESTAMP WHERE cust_id = NEW.cust_id;
END;
//

CREATE TRIGGER cart_entries_after_update
AFTER UPDATE ON cart_entries
FOR EACH ROW
BEGIN
    UPDATE carts SET last_updated = CURRENT_TIMESTAMP WHERE cust_id = NEW.cust_id;
END;
//

CREATE TRIGGER cart_entries_after_delete
AFTER DELETE ON cart_entries
FOR EACH ROW
BEGIN
    UPDATE carts SET last_updated = CURRENT_TIMESTAMP WHERE cust_id = OLD.cust_id;
END;
//

DELIMITER ;

-- Lookup table for allowed payment methods
CREATE TABLE payment_methods (
    method_id INT AUTO_INCREMENT PRIMARY KEY,
    method_name VARCHAR(32) NOT NULL UNIQUE
);
-- Populate with common methods
INSERT INTO payment_methods (method_name) VALUES
('Credit Card'),
('Debit Card'),
('PayPal'),
('Stripe'),
('Cash on Delivery'),
('UPI');
# Payment corresponding to given order
CREATE TABLE payments (
    id INT AUTO_INCREMENT,
    order_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method_id INT NOT NULL,
    status ENUM('Pending', 'Completed', 'Failed', 'Refunded', 'Cancelled') NOT NULL DEFAULT 'Pending',
    paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    txn_reference VARCHAR(64),
    
    PRIMARY KEY (id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (method_id) REFERENCES payment_methods(method_id)
);
CREATE TABLE orders (	# Order history of customers stored here
    id INT AUTO_INCREMENT,
    cust_id INT NOT NULL,
    order_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    address_json JSON NOT NULL,
	total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Placed',
    notes VARCHAR(255),
    
    PRIMARY KEY (id),
    -- UNIQUE KEY (cust_id, order_time),	# Not really required
    FOREIGN KEY (cust_id) REFERENCES customers(id)
);
CREATE TABLE ordered_entries (	# Ordered item entries
    order_id INT NOT NULL,	
    item_id INT NOT NULL,		# Since deprecated items also stored in items, we could extract name through id
    price DECIMAL(10,2) NOT NULL,		# Price at the time of purchase
	qty INT NOT NULL,
    
    PRIMARY KEY (order_id, item_id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);