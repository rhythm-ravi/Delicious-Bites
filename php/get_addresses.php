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

    // Fetch all saved addresses for the customer
    $stmt = $mysqli->prepare("SELECT id, name, address1, address2, landmark, postal_code, state FROM addresses WHERE cust_id = ? ORDER BY id DESC");
    if (!$stmt) {
        throw new Exception("Failed to prepare address fetch query: " . $mysqli->error);
    }
    
    $stmt->bind_param("i", $cust_id);
    if (!$stmt->execute()) {
        throw new Exception("Failed to execute address fetch query: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $addresses = [];
    while ($row = $result->fetch_assoc()) {
        $addresses[] = $row;
    }
    $stmt->close();

    $response['success'] = true;
    $response['addresses'] = $addresses;

} catch (Exception $e) {
    http_response_code(500);
    $response['error'] = $e->getMessage();
} finally {
    if (isset($mysqli) && $mysqli instanceof mysqli) $mysqli->close();
    echo json_encode($response);
    exit;
}
?>
