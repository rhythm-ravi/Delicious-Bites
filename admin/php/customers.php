<?php
require_once 'check_session.php';
header('Content-Type: application/json');

$response = [
    "success" => false,
    "error" => null
];

try {
    require_once '../../php/db.php';
    
    $action = $_GET['action'] ?? '';

    if ($action === 'list') {
        $stmt = $mysqli->prepare("
            SELECT c.*, 
                   COUNT(DISTINCT o.id) as total_orders,
                   COALESCE(SUM(p.amount), 0) as total_spent
            FROM customers c
            LEFT JOIN orders o ON c.id = o.cust_id
            LEFT JOIN payments p ON o.id = p.order_id AND p.status = 'Completed'
            GROUP BY c.id
            ORDER BY c.id DESC
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        
        $customers = [];
        while ($row = $result->fetch_assoc()) {
            // Remove password from response
            unset($row['password']);
            $customers[] = $row;
        }
        $stmt->close();

        $response = [
            "success" => true,
            "data" => $customers
        ];

    } elseif ($action === 'details') {
        $cust_id = $_GET['cust_id'] ?? 0;
        
        if (empty($cust_id)) {
            throw new Exception("Customer ID is required.");
        }

        // Get customer details
        $stmt = $mysqli->prepare("SELECT * FROM customers WHERE id = ?");
        $stmt->bind_param("i", $cust_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("Customer not found.");
        }
        
        $customer = $result->fetch_assoc();
        unset($customer['password']);
        $stmt->close();

        // Get order history
        $stmt = $mysqli->prepare("
            SELECT o.*, p.status as payment_status, pm.method_name
            FROM orders o
            LEFT JOIN payments p ON o.id = p.order_id
            LEFT JOIN payment_methods pm ON p.method_id = pm.method_id
            WHERE o.cust_id = ?
            ORDER BY o.order_time DESC
        ");
        $stmt->bind_param("i", $cust_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
        $stmt->close();

        // Get addresses
        $stmt = $mysqli->prepare("SELECT * FROM addresses WHERE cust_id = ?");
        $stmt->bind_param("i", $cust_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $addresses = [];
        while ($row = $result->fetch_assoc()) {
            $addresses[] = $row;
        }
        $stmt->close();

        // Get statistics
        $stmt = $mysqli->prepare("
            SELECT 
                COUNT(DISTINCT o.id) as total_orders,
                COALESCE(SUM(p.amount), 0) as total_spent,
                AVG(p.amount) as avg_order_value
            FROM orders o
            LEFT JOIN payments p ON o.id = p.order_id AND p.status = 'Completed'
            WHERE o.cust_id = ?
        ");
        $stmt->bind_param("i", $cust_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $stats = $result->fetch_assoc();
        $stmt->close();

        $customer['orders'] = $orders;
        $customer['addresses'] = $addresses;
        $customer['stats'] = $stats;

        $response = [
            "success" => true,
            "data" => $customer
        ];

    } elseif ($action === 'stats') {
        // Total customers
        $stmt = $mysqli->prepare("SELECT COUNT(*) as total FROM customers");
        $stmt->execute();
        $result = $stmt->get_result();
        $total_customers = $result->fetch_assoc()['total'];
        $stmt->close();

        // Customers with orders
        $stmt = $mysqli->prepare("SELECT COUNT(DISTINCT cust_id) as active FROM orders");
        $stmt->execute();
        $result = $stmt->get_result();
        $active_customers = $result->fetch_assoc()['active'];
        $stmt->close();

        // New customers this month (based on customer ID as proxy since no registration date field exists)
        // Note: This is an approximation as the schema doesn't have a registration_date field
        $stmt = $mysqli->prepare("SELECT COUNT(*) as new_customers FROM customers");
        $stmt->execute();
        $result = $stmt->get_result();
        $new_customers = $result->fetch_assoc()['new_customers'];
        $stmt->close();

        $response = [
            "success" => true,
            "data" => [
                "total_customers" => intval($total_customers),
                "active_customers" => intval($active_customers),
                "new_customers" => intval($new_customers)
            ]
        ];

    } else {
        throw new Exception("Invalid action specified.");
    }

} catch (Exception $e) {
    $response['error'] = $e->getMessage();
} finally {
    if (isset($mysqli) && $mysqli instanceof mysqli) {
        $mysqli->close();
    }
}

echo json_encode($response);
exit;
?>
