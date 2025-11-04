<?php
require_once 'check_session.php';
header('Content-Type: application/json');

$response = [
    "success" => false,
    "error" => null
];

try {
    require_once '../../php/db.php';
    
    $action = $_GET['action'] ?? $_POST['action'] ?? '';

    if ($action === 'list') {
        $status = $_GET['status'] ?? 'all';
        
        $query = "
            SELECT o.*, c.username, c.first_name, c.last_name, c.email_id, c.mobile,
                   p.status as payment_status, pm.method_name
            FROM orders o
            JOIN customers c ON o.cust_id = c.id
            LEFT JOIN payments p ON o.id = p.order_id
            LEFT JOIN payment_methods pm ON p.method_id = pm.method_id
        ";
        
        if ($status !== 'all') {
            $query .= " WHERE o.status = ?";
        }
        
        $query .= " ORDER BY o.order_time DESC";
        
        $stmt = $mysqli->prepare($query);
        if ($status !== 'all') {
            $stmt->bind_param("s", $status);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
        $stmt->close();

        $response = [
            "success" => true,
            "data" => $orders
        ];

    } elseif ($action === 'details') {
        $order_id = $_GET['order_id'] ?? 0;
        
        if (empty($order_id)) {
            throw new Exception("Order ID is required.");
        }

        // Get order details
        $stmt = $mysqli->prepare("
            SELECT o.*, c.username, c.first_name, c.last_name, c.email_id, c.mobile,
                   p.status as payment_status, pm.method_name, p.paid_at, p.txn_reference
            FROM orders o
            JOIN customers c ON o.cust_id = c.id
            LEFT JOIN payments p ON o.id = p.order_id
            LEFT JOIN payment_methods pm ON p.method_id = pm.method_id
            WHERE o.id = ?
        ");
        $stmt->bind_param("i", $order_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("Order not found.");
        }
        
        $order = $result->fetch_assoc();
        $stmt->close();

        // Get ordered items
        $stmt = $mysqli->prepare("
            SELECT oe.*, i.name, i.code, i.img_url
            FROM ordered_entries oe
            JOIN items i ON oe.item_id = i.id
            WHERE oe.order_id = ?
        ");
        $stmt->bind_param("i", $order_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        $stmt->close();

        $order['items'] = $items;

        $response = [
            "success" => true,
            "data" => $order
        ];

    } elseif ($action === 'update_status') {
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            throw new Exception("Only POST requests are allowed.");
        }

        $order_id = $_POST['order_id'] ?? 0;
        $new_status = $_POST['status'] ?? '';

        if (empty($order_id) || empty($new_status)) {
            throw new Exception("Order ID and status are required.");
        }

        $valid_statuses = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
        if (!in_array($new_status, $valid_statuses)) {
            throw new Exception("Invalid status.");
        }

        $stmt = $mysqli->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $new_status, $order_id);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to update order status.");
        }
        $stmt->close();

        $response = [
            "success" => true,
            "message" => "Order status updated successfully"
        ];

    } elseif ($action === 'statistics') {
        // Total orders
        $stmt = $mysqli->prepare("SELECT COUNT(*) as total FROM orders");
        $stmt->execute();
        $result = $stmt->get_result();
        $total_orders = $result->fetch_assoc()['total'];
        $stmt->close();

        // Pending orders (not delivered or cancelled)
        $stmt = $mysqli->prepare("SELECT COUNT(*) as pending FROM orders WHERE status NOT IN ('Delivered', 'Cancelled')");
        $stmt->execute();
        $result = $stmt->get_result();
        $pending_orders = $result->fetch_assoc()['pending'];
        $stmt->close();

        // Revenue today
        $stmt = $mysqli->prepare("SELECT COALESCE(SUM(p.amount), 0) as revenue FROM payments p JOIN orders o ON p.order_id = o.id WHERE p.status = 'Completed' AND DATE(o.order_time) = CURDATE()");
        $stmt->execute();
        $result = $stmt->get_result();
        $revenue_today = $result->fetch_assoc()['revenue'];
        $stmt->close();

        // Revenue this week
        $stmt = $mysqli->prepare("SELECT COALESCE(SUM(p.amount), 0) as revenue FROM payments p JOIN orders o ON p.order_id = o.id WHERE p.status = 'Completed' AND YEARWEEK(o.order_time, 1) = YEARWEEK(CURDATE(), 1)");
        $stmt->execute();
        $result = $stmt->get_result();
        $revenue_week = $result->fetch_assoc()['revenue'];
        $stmt->close();

        // Revenue this month
        $stmt = $mysqli->prepare("SELECT COALESCE(SUM(p.amount), 0) as revenue FROM payments p JOIN orders o ON p.order_id = o.id WHERE p.status = 'Completed' AND MONTH(o.order_time) = MONTH(CURDATE()) AND YEAR(o.order_time) = YEAR(CURDATE())");
        $stmt->execute();
        $result = $stmt->get_result();
        $revenue_month = $result->fetch_assoc()['revenue'];
        $stmt->close();

        $response = [
            "success" => true,
            "data" => [
                "total_orders" => intval($total_orders),
                "pending_orders" => intval($pending_orders),
                "revenue_today" => floatval($revenue_today),
                "revenue_week" => floatval($revenue_week),
                "revenue_month" => floatval($revenue_month)
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
