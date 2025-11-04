-- ============================================
-- DUMMY ORDER HISTORY FOR USER 'RRR'
-- ============================================

USE prodb;

-- First, let's get the customer ID for user 'RRR'
-- (Assuming RRR already exists in customers table)
-- If not, create the user first:
-- INSERT INTO customers (username, first_name, last_name, mobile, email_id, password)
-- VALUES ('RRR', 'Test', 'User', '9876543210', 'rrr@example.com', '$2y$10$...');

-- ============================================
-- ORDER 1: Breakfast Order (2 days ago)
-- ============================================

-- Insert Order 1
INSERT INTO orders (cust_id, order_time, address_json, total_amount, status, notes)
VALUES (
    (SELECT id FROM customers WHERE username = 'RRR'),
    DATE_SUB(NOW(), INTERVAL 2 DAY),  -- 2 days ago
    JSON_OBJECT(
        'name', 'Home',
        'address1', '123 Main Street, Apt 4B',
        'address2', 'Near Central Park',
        'landmark', 'Blue Building',
        'postal_code', '110001',
        'state', 'Delhi'
    ),
    24.50,
    'Delivered',
    'Please ring the doorbell twice'
);

-- Get the order ID for Order 1
SET @order1_id = LAST_INSERT_ID();

-- Insert ordered items for Order 1 (Breakfast: Pancakes + Chocolate Sundae)
INSERT INTO ordered_entries (order_id, item_id, price, qty) VALUES
    (@order1_id, 8, 14.00, 1),   -- Pancake Tower x1
    (@order1_id, 9, 7.50, 1),    -- Chocolate Sundae x1
    (@order1_id, 10, 3.00, 1);   -- Strawberry Cupcake x1

-- Insert payment record for Order 1
INSERT INTO payments (order_id, amount, method_id, status, paid_at, txn_reference)
VALUES (
    @order1_id,
    24.50,
    (SELECT method_id FROM payment_methods WHERE method_name = 'UPI'),
    'Completed',
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    CONCAT('TXN-', UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 2 DAY)), '-', FLOOR(RAND() * 10000))
);


-- ============================================
-- ORDER 2: Dinner Order (Yesterday)
-- ============================================

-- Insert Order 2
INSERT INTO orders (cust_id, order_time, address_json, total_amount, status, notes)
VALUES (
    (SELECT id FROM customers WHERE username = 'RRR'),
    DATE_SUB(NOW(), INTERVAL 1 DAY),  -- Yesterday
    JSON_OBJECT(
        'name', 'Office',
        'address1', '456 Business Tower, Floor 12',
        'address2', 'Sector 18, Cyber City',
        'landmark', 'Opposite Metro Station',
        'postal_code', '122001',
        'state', 'Haryana'
    ),
    63.99,
    'Delivered',
    'Leave at reception desk'
);

-- Get the order ID for Order 2
SET @order2_id = LAST_INSERT_ID();

-- Insert ordered items for Order 2 (Dinner: Pizza + Fries + Burger + Drumsticks)
INSERT INTO ordered_entries (order_id, item_id, price, qty) VALUES
    (@order2_id, 7, 21.99, 1),   -- Farm-Fresh Pizza x1
    (@order2_id, 4, 10.00, 2),   -- Peri-Peri Drumsticks x2
    (@order2_id, 3, 5.00, 2),    -- French Fries x2
    (@order2_id, 6, 5.00, 2);    -- Veggie Burger x2

-- Insert payment record for Order 2
INSERT INTO payments (order_id, amount, method_id, status, paid_at, txn_reference)
VALUES (
    @order2_id,
    63.99,
    (SELECT method_id FROM payment_methods WHERE method_name = 'Credit Card'),
    'Completed',
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    CONCAT('TXN-', UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY)), '-', FLOOR(RAND() * 10000))
);


-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- View all orders for RRR
SELECT 
    o.id AS order_id,
    o.order_time,
    o.total_amount,
    o.status,
    p.status AS payment_status,
    pm.method_name
FROM orders o
JOIN payments p ON o.id = p.order_id
JOIN payment_methods pm ON p.method_id = pm.method_id
WHERE o.cust_id = (SELECT id FROM customers WHERE username = 'RRR')
ORDER BY o.order_time DESC;

-- View order details with items
SELECT 
    o.id AS order_id,
    o.order_time,
    i.name AS item_name,
    oe.qty,
    oe.price,
    (oe.qty * oe.price) AS item_total
FROM orders o
JOIN ordered_entries oe ON o.id = oe.order_id
JOIN items i ON oe.item_id = i.id
WHERE o.cust_id = (SELECT id FROM customers WHERE username = 'RRR')
ORDER BY o.order_time DESC, i.name;