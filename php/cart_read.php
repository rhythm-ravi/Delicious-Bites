<?php
session_start();
header('Content-Type: application/json');

$response = [
    "success" => false,
    "error" => null
];

try {
    include('db.php');

    if (!isset($_SESSION['user_id'])) {     // api however would only be called after user logged in
        throw new Exception("Authentication required.");
    }
    $cust_id = $_SESSION['user_id'];

    // Fetch cart last_updated timestamp
    $cart_stmt = $mysqli->prepare("SELECT last_updated FROM carts WHERE cust_id = ?");
    if (!$cart_stmt) {
        throw new Exception("Failed to prepare cart timestamp fetch query: " . $mysqli->error);
    }
    $cart_stmt->bind_param("i", $cust_id);
    if (!$cart_stmt->execute()) {
        throw new Exception("Failed to execute cart timestamp fetch query: " . $cart_stmt->error);
    }
    $cart_result = $cart_stmt->get_result();
    $timestamp = null;
    if ($row = $cart_result->fetch_assoc()) {
        $timestamp = $row['last_updated'];
    } else {
        throw new Exception("Cart not found for user.");
    }

    // Fetch cart items
    $entries_stmt = $mysqli->prepare("SELECT item_id, qty FROM cart_entries WHERE cust_id = ?");
    if (!$entries_stmt) {
        throw new Exception("Failed to prepare cart fetch query: " . $mysqli->error);
    }
    $entries_stmt->bind_param("i", $cust_id);
    if (!$entries_stmt->execute()) {
        throw new Exception("Failed to execute cart fetch query: " . $entries_stmt->error);
    }
    $entries_result = $entries_stmt->get_result();
    $cart = [];
    while ($row = $entries_result->fetch_assoc()) {
        $cart[$row['item_id']] = $row['qty'];
    }

    $response['success'] = true;
    $response['timestamp'] = $timestamp;
    $response['cart'] = $cart;

} catch (Exception $e) {
    http_response_code(500);
    $response['error'] = $e->getMessage();
} finally {
    if (isset($cart_stmt) && $cart_stmt instanceof mysqli_stmt) $cart_stmt->close();
    if (isset($entries_stmt) && $entries_stmt instanceof mysqli_stmt) $entries_stmt->close();
    if (isset($mysqli) && $mysqli instanceof mysqli) $mysqli->close();
    echo json_encode($response);
    exit;
}
?>