<?php
session_start();
header('Content-Type: application/json');

$response = [
    "success" => false,
    "error" => null
];

try {
    // Admin credentials (hardcoded)
    define('ADMIN_USERNAME', 'admin');
    // Password: admin123 (hashed)
    define('ADMIN_PASSWORD_HASH', '$2y$10$n10BznKRu.uQfgYykTFPQ.SOnapaXhsuE7yUD9vseBqUnrOXtZ86K');

    $action = $_GET['action'] ?? $_POST['action'] ?? '';

    if ($action === 'login') {
        if ($_SERVER["REQUEST_METHOD"] !== "POST") {
            throw new Exception("Only POST requests are allowed.");
        }

        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        if (empty($username) || empty($password)) {
            throw new Exception("Username and password are required.");
        }

        if ($username !== ADMIN_USERNAME) {
            throw new Exception("Invalid credentials.");
        }

        if (!password_verify($password, ADMIN_PASSWORD_HASH)) {
            throw new Exception("Invalid credentials.");
        }

        // Set admin session
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = ADMIN_USERNAME;
        $_SESSION['admin_login_time'] = time();

        $response = [
            "success" => true,
            "message" => "Login successful",
            "username" => ADMIN_USERNAME
        ];

    } elseif ($action === 'logout') {
        // Clear admin session
        unset($_SESSION['admin_logged_in']);
        unset($_SESSION['admin_username']);
        unset($_SESSION['admin_login_time']);
        session_destroy();

        $response = [
            "success" => true,
            "message" => "Logged out successfully"
        ];

    } elseif ($action === 'check') {
        // Check if admin is logged in
        if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
            // Check session timeout (30 minutes)
            $timeout = 1800; // 30 minutes in seconds
            if (time() - $_SESSION['admin_login_time'] > $timeout) {
                unset($_SESSION['admin_logged_in']);
                unset($_SESSION['admin_username']);
                unset($_SESSION['admin_login_time']);
                throw new Exception("Session expired. Please login again.");
            }

            // Update last activity time
            $_SESSION['admin_login_time'] = time();

            $response = [
                "success" => true,
                "logged_in" => true,
                "username" => $_SESSION['admin_username']
            ];
        } else {
            $response = [
                "success" => true,
                "logged_in" => false
            ];
        }

    } else {
        throw new Exception("Invalid action specified.");
    }

} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
exit;
?>
