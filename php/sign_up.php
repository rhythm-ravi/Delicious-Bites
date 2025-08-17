<?php
session_start();
header('Content-Type: application/json');

$response = [
    "success" => false,
    "errors" => []
];

try {
    // ONLY allow POST
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        http_response_code(405);
        throw new Exception("Only POST requests are allowed.");
    }

    include('db.php');

    // Extract and validate user input
    $username = $_POST['username'] ?? null;
    $first_name = $_POST['first-name'] ?? null;
    $last_name = $_POST['last-name'] ?? null;
    $mobile = $_POST['mobile'] ?? null;
    $email_id = $_POST['email'] ?? null;
    $password = $_POST['password'] ?? null;

    if (!$username || !$first_name || !$mobile || !$email_id || !$password) {
        throw new Exception("Missing required fields.");
    }

    // Input formats already validated client-side, and also at db via constraints
    // prepared statements protect us from sql injection
    // however, no server side validation may open us to certain logic abuse attacks (maybe)
    // also obv our db may be vulnerable to DoS / resource exhaustion if attacker tries to send large field vals,  but even server-side validation simply shifts load from db to server
    // so may need to include server-side validation just for good measure maybe

    // Check for duplicate entries
    $query = "SELECT mobile, username, email_id FROM customers WHERE mobile = ? OR username = ? OR email_id = ?";
    $stmt = $mysqli->prepare($query);       
    $stmt->bind_param("sss", $mobile, $username, $email_id);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($db_mobile, $db_username, $db_email);
        while ($stmt->fetch()) {
            if ($mobile === $db_mobile) {
                $response['errors'][] = "Duplicate field: Mobile number is already registered.";
            }
            if (strtolower($username) === strtolower($db_username)) {       // username and email should be case-insensitive
                $response['errors'][] = "Duplicate field: Username is already taken.";
            }
            if (strtolower($email_id) === strtolower($db_email)) {
                $response['errors'][] = "Duplicate field: Email address is already registered.";
            }
        }
    }
    // $stmt->close();

    // If there are duplicate errors, return them
    if (!empty($response['errors'])) {
        echo json_encode($response);
        exit();
    }

    // Hash the password
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    // Insert new user into the database
    $insert_query = "INSERT INTO customers (username, first_name, last_name, mobile, email_id, password) VALUES (?, ?, ?, ?, ?, ?)";
    if ($stmt = $mysqli->prepare($insert_query)) {
        $stmt->bind_param("ssssss", $username, $first_name, $last_name, $mobile, $email_id, $hashed_password);
        if ($stmt->execute()) {
            // If insertion is successful
            $response['success'] = true;
            $response['message'] = "User registered successfully.";
        } else {
            throw new Exception("Failed to execute query: " . $stmt->error);
        }
        // $stmt->close();
    } else {
        throw new Exception("Failed to prepare insert query: " . $mysqli->error);
    }
} catch (Exception $e) {
    $response['errors'][] = $e->getMessage();
} finally {
    if (isset($stmt) && $stmt instanceof mysqli_stmt) $stmt->close();
    if (isset($mysqli) && $mysqli instanceof mysqli) $mysqli->close();
    echo json_encode($response);
    exit();
}  
?>
