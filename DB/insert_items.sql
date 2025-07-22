-- This SQL script inserts initial items into the 'items' table in the 'prodb' database.

use prodb;

INSERT INTO items (id, code, name, price, item_desc) VALUES
	(1, 'CCS', 'Crispy Chicken Slider', 5.00, 'Tender crispy chicken in a soft slider bun'),
	(2, 'PDP', 'Paneer Deluxe Pizza', 20.00, 'Cheesy pizza topped with marinated paneer and veggies'),
	(3, 'FF', 'French Fries', 5.00, 'Golden, crispy French fries served hot'),
	(4, 'PPD', 'Peri-Peri Drumsticks', 10.00, 'Spicy peri-peri marinated chicken drumsticks'),
	(5, 'CS', 'Classic Spaghetti', 18.00, 'Classic Italian spaghetti with tomato basil sauce'),
	(6, 'VB', 'Veggie Burger', 5.00, 'Grilled veggie patty with lettuce, tomato, and sauce'),
	(7, 'FFP', 'Farm-Fresh Pizza', 21.99, 'Pizza loaded with fresh farm vegetables and mozzarella'),
	(8, 'PT', 'Pancake Tower', 14.00, 'Stack of fluffy pancakes with syrup and berries'),
	(9, 'CSU', 'Chocolate Sundae', 7.50, 'Creamy chocolate sundae with nuts and cherry'),
	(10, 'SC', 'Strawberry Cupcake', 3.00, 'Soft cupcake topped with strawberry frosting and sprinkles');
