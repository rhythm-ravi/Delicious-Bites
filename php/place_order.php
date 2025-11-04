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

    // Parse JSON body
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) throw new Exception("Invalid input. JSON expected.");

    $address_id = $data['address_id'] ?? null;
    $new_address = $data['new_address'] ?? null;
    $payment_method_id = $data['payment_method_id'] ?? null;
    $notes = $data['notes'] ?? '';

    if (!$payment_method_id || !is_numeric($payment_method_id)) {
        throw new Exception("Valid payment method is required.");
    }

    // Start transaction
    $mysqli->begin_transaction();

    try {
        // Get address JSON
        $address_json = null;
        if ($address_id && is_numeric($address_id)) {
            // Fetch from addresses table
            $addr_stmt = $mysqli->prepare("SELECT address1, address2, landmark, postal_code, state, name FROM addresses WHERE id = ? AND cust_id = ?");
            if (!$addr_stmt) throw new Exception("Failed to prepare address fetch: " . $mysqli->error);
            $addr_stmt->bind_param("ii", $address_id, $cust_id);
            if (!$addr_stmt->execute()) throw new Exception("Failed to fetch address: " . $addr_stmt->error);
            $addr_result = $addr_stmt->get_result();
            $address_row = $addr_result->fetch_assoc();
            if (!$address_row) throw new Exception("Address not found.");
            $address_json = json_encode($address_row);
            $addr_stmt->close();
        } elseif ($new_address && is_array($new_address)) {
            // Use provided new address
            $address_json = json_encode($new_address);
        } else {
            throw new Exception("Valid address is required.");
        }

        // Get cart items and calculate total
        $cart_stmt = $mysqli->prepare("
            SELECT ce.item_id, ce.qty, i.price 
            FROM cart_entries ce 
            JOIN items i ON ce.item_id = i.id 
            WHERE ce.cust_id = ?
        ");
        if (!$cart_stmt) throw new Exception("Failed to prepare cart fetch: " . $mysqli->error);
        $cart_stmt->bind_param("i", $cust_id);
        if (!$cart_stmt->execute()) throw new Exception("Failed to fetch cart: " . $cart_stmt->error);
        $cart_result = $cart_stmt->get_result();
        
        $cart_items = [];
        $total_amount = 0;
        while ($row = $cart_result->fetch_assoc()) {
            $cart_items[] = $row;
            $total_amount += $row['price'] * $row['qty'];
        }
        $cart_stmt->close();

        if (empty($cart_items)) {
            throw new Exception("Cart is empty.");
        }

        // Create order record
        $order_stmt = $mysqli->prepare("
            INSERT INTO orders (cust_id, address_json, total_amount, status, notes) 
            VALUES (?, ?, ?, 'Placed', ?)
        ");
        if (!$order_stmt) throw new Exception("Failed to prepare order insert: " . $mysqli->error);
        $order_stmt->bind_param("isds", $cust_id, $address_json, $total_amount, $notes);
        if (!$order_stmt->execute()) throw new Exception("Failed to create order: " . $order_stmt->error);
        $order_id = $mysqli->insert_id;
        $order_stmt->close();

        // Create ordered_entries records
        $entry_stmt = $mysqli->prepare("
            INSERT INTO ordered_entries (order_id, item_id, price, qty) 
            VALUES (?, ?, ?, ?)
        ");
        if (!$entry_stmt) throw new Exception("Failed to prepare order entry insert: " . $mysqli->error);
        
        foreach ($cart_items as $item) {
            $entry_stmt->bind_param("iidi", $order_id, $item['item_id'], $item['price'], $item['qty']);
            if (!$entry_stmt->execute()) throw new Exception("Failed to create order entry: " . $entry_stmt->error);
        }
        $entry_stmt->close();

        // Generate dummy transaction reference
        $txn_reference = 'TXN-' . time() . '-' . rand(1000, 9999);

        // Create payment record
        $payment_stmt = $mysqli->prepare("
            INSERT INTO payments (order_id, amount, method_id, status, txn_reference) 
            VALUES (?, ?, ?, 'Pending', ?)
        ");
        if (!$payment_stmt) throw new Exception("Failed to prepare payment insert: " . $mysqli->error);
        $payment_stmt->bind_param("idis", $order_id, $total_amount, $payment_method_id, $txn_reference);
        if (!$payment_stmt->execute()) throw new Exception("Failed to create payment: " . $payment_stmt->error);
        $payment_stmt->close();

        // Clear customer's cart
        $clear_stmt = $mysqli->prepare("DELETE FROM cart_entries WHERE cust_id = ?");
        if (!$clear_stmt) throw new Exception("Failed to prepare cart clear: " . $mysqli->error);
        $clear_stmt->bind_param("i", $cust_id);
        if (!$clear_stmt->execute()) throw new Exception("Failed to clear cart: " . $clear_stmt->error);
        $clear_stmt->close();

        // Commit transaction
        $mysqli->commit();

        $response['success'] = true;
        $response['order_id'] = $order_id;
        $response['txn_reference'] = $txn_reference;
        $response['total_amount'] = $total_amount;

    } catch (Exception $e) {
        // Rollback transaction on error
        $mysqli->rollback();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(500);
    $response['error'] = $e->getMessage();
} finally {
    if (isset($mysqli) && $mysqli instanceof mysqli) $mysqli->close();
    echo json_encode($response);
    exit;
}
?>
