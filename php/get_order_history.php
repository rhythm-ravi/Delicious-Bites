<?php
session_start();
header('Content-Type: application/json');

$response = [
    "success" => false,
    "error" => null
];

try {
    include('db.php');

    if (!isset($_SESSION['user_id'])) {
        throw new Exception("Authentication required.");
    }
    $cust_id = $_SESSION['user_id'];

    // Fetch orders with payment details
    $orders_stmt = $mysqli->prepare("
        SELECT 
            o.id,
            o.order_time,
            o.address_json,
            o.total_amount,
            o.status,
            o.notes,
            p.status as payment_status,
            p.method_id,
            p.paid_at,
            pm.method_name
        FROM orders o
        LEFT JOIN payments p ON o.id = p.order_id
        LEFT JOIN payment_methods pm ON p.method_id = pm.method_id
        WHERE o.cust_id = ?
        ORDER BY o.order_time DESC
    ");
    
    if (!$orders_stmt) {
        throw new Exception("Failed to prepare orders fetch query: " . $mysqli->error);
    }
    
    $orders_stmt->bind_param("i", $cust_id);
    if (!$orders_stmt->execute()) {
        throw new Exception("Failed to execute orders fetch query: " . $orders_stmt->error);
    }
    
    $orders_result = $orders_stmt->get_result();
    $orders = [];
    
    while ($order = $orders_result->fetch_assoc()) {
        $order_id = $order['id'];
        
        // Fetch order items for this order
        $items_stmt = $mysqli->prepare("
            SELECT 
                oe.item_id,
                oe.qty,
                oe.price,
                i.name,
                i.img_url
            FROM ordered_entries oe
            LEFT JOIN items i ON oe.item_id = i.id
            WHERE oe.order_id = ?
        ");
        
        if (!$items_stmt) {
            throw new Exception("Failed to prepare items fetch query: " . $mysqli->error);
        }
        
        $items_stmt->bind_param("i", $order_id);
        if (!$items_stmt->execute()) {
            throw new Exception("Failed to execute items fetch query: " . $items_stmt->error);
        }
        
        $items_result = $items_stmt->get_result();
        $items = [];
        
        while ($item = $items_result->fetch_assoc()) {
            $items[] = $item;
        }
        $items_stmt->close();
        
        // Decode address JSON
        $order['address'] = json_decode($order['address_json'], true);
        unset($order['address_json']);
        
        // Add items to order
        $order['items'] = $items;
        
        $orders[] = $order;
    }
    $orders_stmt->close();

    $response['success'] = true;
    $response['orders'] = $orders;

} catch (Exception $e) {
    http_response_code(500);
    $response['error'] = $e->getMessage();
} finally {
    if (isset($mysqli) && $mysqli instanceof mysqli) $mysqli->close();
    echo json_encode($response);
    exit;
}
?>
