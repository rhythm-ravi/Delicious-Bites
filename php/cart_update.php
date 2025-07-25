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

    $client_timestamp = $data['timestamp'] ?? null;
    $item_id = $data['item_id'] ?? null;
    $qty = $data['qty'] ?? null;

    if (!is_numeric($item_id) || !is_numeric($qty) || $client_timestamp === null) {
        throw new Exception("Missing or invalid parameters.");
    }

    // Fetch current cart timestamp
    $cart_stmt = $mysqli->prepare("SELECT last_updated FROM carts WHERE cust_id = ?");
    if (!$cart_stmt) {
        throw new Exception("Failed to prepare cart timestamp fetch query: " . $mysqli->error);
    }
    $cart_stmt->bind_param("i", $cust_id);
    if (!$cart_stmt->execute()) {
        throw new Exception("Failed to execute cart timestamp fetch query: " . $cart_stmt->error);
    }
    $cart_result = $cart_stmt->get_result();
    $server_timestamp = null;
    if ($row = $cart_result->fetch_assoc()) {
        $server_timestamp = $row['last_updated'];
    } else {
        throw new Exception("Cart not found for user.");
    }

    // Check for timestamp conflict
    if ($client_timestamp !== $server_timestamp) {
        $response['error'] = "outdated_cart";
        $response['timestamp'] = $server_timestamp;
        // Do NOT return the cart itself; client should call cart_read for the latest cart.
        echo json_encode($response);
        exit;
    }

    // Check if entry exists
    $check_stmt = $mysqli->prepare("SELECT qty FROM cart_entries WHERE cust_id = ? AND item_id = ?");
    if (!$check_stmt) throw new Exception("Failed to prepare cart entry check: " . $mysqli->error);
    $check_stmt->bind_param("ii", $cust_id, $item_id);
    if (!$check_stmt->execute()) throw new Exception("Failed to execute cart entry check: " . $check_stmt->error);
    $check_result = $check_stmt->get_result();
    $exists = $check_result->fetch_assoc();
    $check_stmt->close();

    if ($qty > 0) {
        if ($exists) {
            // Update existing entry
            $update_stmt = $mysqli->prepare("UPDATE cart_entries SET qty = ? WHERE cust_id = ? AND item_id = ?");
            if (!$update_stmt) throw new Exception("Failed to prepare cart entry update: " . $mysqli->error);
            $update_stmt->bind_param("iii", $qty, $cust_id, $item_id);
            if (!$update_stmt->execute()) throw new Exception("Failed to update cart entry: " . $update_stmt->error);
            $update_stmt->close();
        } else {
            // Insert new entry
            $insert_stmt = $mysqli->prepare("INSERT INTO cart_entries (cust_id, item_id, qty) VALUES (?, ?, ?)");
            if (!$insert_stmt) throw new Exception("Failed to prepare cart entry insert: " . $mysqli->error);
            $insert_stmt->bind_param("iii", $cust_id, $item_id, $qty);
            if (!$insert_stmt->execute()) throw new Exception("Failed to insert cart entry: " . $insert_stmt->error);
            $insert_stmt->close();
        }
    } else {
        if ($exists) {
            // Delete entry
            $delete_stmt = $mysqli->prepare("DELETE FROM cart_entries WHERE cust_id = ? AND item_id = ?");
            if (!$delete_stmt) throw new Exception("Failed to prepare cart entry delete: " . $mysqli->error);
            $delete_stmt->bind_param("ii", $cust_id, $item_id);
            if (!$delete_stmt->execute()) throw new Exception("Failed to delete cart entry: " . $delete_stmt->error);
            $delete_stmt->close();
        }
        // If doesn't exist and qty <= 0, nothing to do
    }

    // Fetch new timestamp
    $cart_stmt2 = $mysqli->prepare("SELECT last_updated FROM carts WHERE cust_id = ?");
    if (!$cart_stmt2) throw new Exception("Failed to prepare cart timestamp fetch query: " . $mysqli->error);
    $cart_stmt2->bind_param("i", $cust_id);
    if (!$cart_stmt2->execute()) throw new Exception("Failed to execute cart timestamp fetch query: " . $cart_stmt2->error);
    $cart_result2 = $cart_stmt2->get_result();
    $new_timestamp = null;
    if ($row = $cart_result2->fetch_assoc()) {
        $new_timestamp = $row['last_updated'];
    }
    $cart_stmt2->close();

    $response['success'] = true;
    $response['timestamp'] = $new_timestamp;

} catch (Exception $e) {
    http_response_code(500);
    $response['error'] = $e->getMessage();
} finally {
    if (isset($cart_stmt) && $cart_stmt instanceof mysqli_stmt) $cart_stmt->close();
    if (isset($cart_stmt2) && $cart_stmt2 instanceof mysqli_stmt) $cart_stmt2->close();
    if (isset($insert_stmt) && $insert_stmt instanceof mysqli_stmt) $insert_stmt->close();
    if (isset($update_stmt) && $update_stmt instanceof mysqli_stmt) $update_stmt->close();
    if (isset($delete_stmt) && $delete_stmt instanceof mysqli_stmt) $delete_stmt->close();
    if (isset($mysqli) && $mysqli instanceof mysqli) $mysqli->close();
    echo json_encode($response);
    exit;
}
?>