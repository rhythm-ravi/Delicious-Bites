<?php
// Session validation middleware for admin pages
session_start();

// Check if admin is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "error" => "Unauthorized. Please login."
    ]);
    exit;
}

// Check session timeout (30 minutes)
$timeout = 1800; // 30 minutes
if (!isset($_SESSION['admin_login_time']) || time() - $_SESSION['admin_login_time'] > $timeout) {
    unset($_SESSION['admin_logged_in']);
    unset($_SESSION['admin_username']);
    unset($_SESSION['admin_login_time']);
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode([
        "success" => false,
        "error" => "Session expired. Please login again."
    ]);
    exit;
}

// Update last activity time
$_SESSION['admin_login_time'] = time();
?>
