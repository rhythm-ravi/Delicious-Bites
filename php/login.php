<?php

session_start();
header('Content-Type: application/json');

$response = [
    "success" => false,
    "error" => null
];

try {
    include('db.php');

    // Only allow POST
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        http_response_code(405);
        throw new Exception("Only POST requests are allowed.");
    }

    $identifier = $_POST['identifier'] ?? '';
    $password = $_POST['password'] ?? '';

    // Validate input
    if (!is_string($identifier) || !is_string($password) || trim($identifier) === '' || trim($password) === '') {
        // http_response_code(400);
        throw new Exception("Both identifier and password are required.");
    }

    // Detect identifier type
    $userField = null;
    if (preg_match('/^[0-9]{10}$/', $identifier)) {
        $userField = "mobile";
    } elseif (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
        $userField = "email";
    } elseif (preg_match('/^[A-Za-z][A-Za-z0-9_]{2,14}$/', $identifier)) {
        $userField = "username";
    } else {
        // http_response_code(400);
        throw new Exception("Invalid identifier format. Make sure to enter valid username/email/mobile.");
    }

    // Look up user
    $query = "SELECT id, username, password FROM customers WHERE $userField = ?";
    $stmt = $mysqli->prepare($query);
    if (!$stmt) {
        // http_response_code(500);
        throw new Exception("Failed to prepare user lookup: " . $mysqli->error);
    }

    $stmt->bind_param("s", $identifier);
    if (!$stmt->execute()) {
        $stmt->close();
        // http_response_code(500);
        throw new Exception("Failed to execute user lookup.");
    }
    $stmt->store_result();

    if ($stmt->num_rows !== 1) {
        $stmt->close();
        throw new Exception("Account not found.");
    }

    $stmt->bind_result($user_id, $db_username, $db_password);
    $stmt->fetch();
    $stmt->close();

    // Validate password (plain or hashed)
    if (!(password_verify($password, $db_password) || $password === $db_password)) {
        throw new Exception("Incorrect password.");
    }

    // Set session
    $_SESSION['user_id'] = $user_id;
    $_SESSION['username'] = $db_username;

    $response = [
        "success" => true,
        "userId" => $user_id,
        "userName" => $db_username
    ];

} catch (Exception $e) {
    $response['error'] = $e->getMessage();
} finally {
    // if (isset($stmt) && $stmt instanceof mysqli_stmt) $stmt->close();        // don't close a resource twice, gives error (error also makes json invalid)
    if (isset($mysqli) && $mysqli instanceof mysqli) $mysqli->close();
    echo json_encode($response);
    exit;
}