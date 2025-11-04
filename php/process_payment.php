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

    // Parse JSON body
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) throw new Exception("Invalid input. JSON expected.");

    $order_id = $data['order_id'] ?? null;
    $txn_reference = $data['txn_reference'] ?? null;
    $payment_method_id = $data['payment_method_id'] ?? null;

    if (!$order_id || !$txn_reference || !$payment_method_id) {
        throw new Exception("Missing required parameters.");
    }

    // Simulate 2-3 second processing delay
    sleep(rand(2, 3));

    // Randomly succeed (90% rate) or fail (10% rate)
    $payment_success = (rand(1, 100) <= 90);

    if ($payment_success) {
        // Update payment status to Completed
        $payment_stmt = $mysqli->prepare("
            UPDATE payments 
            SET status = 'Completed', paid_at = NOW() 
            WHERE order_id = ? AND txn_reference = ?
        ");
        if (!$payment_stmt) throw new Exception("Failed to prepare payment update: " . $mysqli->error);
        $payment_stmt->bind_param("is", $order_id, $txn_reference);
        if (!$payment_stmt->execute()) throw new Exception("Failed to update payment: " . $payment_stmt->error);
        $payment_stmt->close();

        // Update order status to Confirmed
        $order_stmt = $mysqli->prepare("
            UPDATE orders 
            SET status = 'Confirmed' 
            WHERE id = ?
        ");
        if (!$order_stmt) throw new Exception("Failed to prepare order update: " . $mysqli->error);
        $order_stmt->bind_param("i", $order_id);
        if (!$order_stmt->execute()) throw new Exception("Failed to update order: " . $order_stmt->error);
        $order_stmt->close();

        $response['success'] = true;
        $response['message'] = 'Payment processed successfully!';
        $response['order_id'] = $order_id;
        $response['status'] = 'Completed';

    } else {
        // Update payment status to Failed
        $payment_stmt = $mysqli->prepare("
            UPDATE payments 
            SET status = 'Failed' 
            WHERE order_id = ? AND txn_reference = ?
        ");
        if (!$payment_stmt) throw new Exception("Failed to prepare payment update: " . $mysqli->error);
        $payment_stmt->bind_param("is", $order_id, $txn_reference);
        if (!$payment_stmt->execute()) throw new Exception("Failed to update payment: " . $payment_stmt->error);
        $payment_stmt->close();

        $response['success'] = false;
        $response['message'] = 'Payment failed. Please try again.';
        $response['order_id'] = $order_id;
        $response['status'] = 'Failed';
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
