<?php

header('Content-Type: application/json');

$response = [
    "success" => false,
    "error" => null
];

try {
    include('db.php');
    
    // Get client timestamp from request (GET or POST)
    $client_ts = $_REQUEST['timestamp'] ?? null;

    // Fetch menu last_updated timestamp
    $menu_stmt = $mysqli->prepare("SELECT last_updated FROM menu WHERE id = 1 LIMIT 1");
    if (!$menu_stmt) {
        throw new Exception("Failed to prepare menu timestamp fetch query: " . $mysqli->error);
    }

    if (!$menu_stmt->execute()) {
        throw new Exception("Failed to execute menu timestamp fetch query: " . $menu_stmt->error);
    }

    $menu_result = $menu_stmt->get_result();
    $timestamp = null;

    if ($row = $menu_result->fetch_assoc()) {
        $timestamp = $row['last_updated'];
    } else {
        throw new Exception("Menu timestamp not found.");
    }

    // If client's timestamp matches, no need to return full data
    if ($client_ts && $timestamp && $client_ts === $timestamp) {
        echo json_encode([
            "timestamp" => $timestamp,
            "unchanged" => true,
            "success" => true
        ]);
        $menu_stmt->close();
        $mysqli->close();
        exit;
    }

    // Fetch menu items that are not deprecated
    $stmt = $mysqli->prepare("SELECT * FROM items WHERE is_deprecated = FALSE");
    if (!$stmt) {
        throw new Exception("Failed to prepare items fetch query: " . $mysqli->error);
    }

    if (!$stmt->execute()) {
        throw new Exception("Failed to execute items fetch query: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $items = [];

    while ($row = $result->fetch_assoc()) {
        $items[strval($row['id'])] = $row;
    }

    // Build response with updated data
    $response = [
        "timestamp" => $timestamp,
        "items" => $items,
        "unchanged" => false,
        "success" => true
    ];

} catch (Exception $e) {
    // If any error occurs, send HTTP 500 and include error message
    http_response_code(500);
    $response['error'] = $e->getMessage();
} finally {
    // Clean up prepared statement for menu, if it was successfully created
    if (isset($menu_stmt) && $menu_stmt instanceof mysqli_stmt) {
        $menu_stmt->close();  // Prevent memory leaks
    }

    // Clean up prepared statement for items query, if it was successfully created
    if (isset($stmt) && $stmt instanceof mysqli_stmt) {
        $stmt->close();  // Good practice to free server resources
    }

    // Close the database connection if it's open
    if (isset($mysqli) && $mysqli instanceof mysqli) {
        $mysqli->close();  // Always close connections when done
    }

    // Send the final response (whether successful or error)
    echo json_encode($response);
    exit;
}
?>




<?php
include('db.php');

// Get client timestamp from GET or POST
$client_ts = $_REQUEST['timestamp'] ?? null;

// Fetch menu last_updated
$menu_stmt = $mysqli->prepare("SELECT last_updated FROM menu WHERE id = 1 LIMIT 1");
$menu_stmt->execute();
$menu_result = $menu_stmt->get_result();
$timestamp = null;
if ($row = $menu_result->fetch_assoc()) {
    $timestamp = $row['last_updated'];
}

// If the client's timestamp matches, return only timestamp and a flag
if ($client_ts && $timestamp && $client_ts === $timestamp) {
    echo json_encode([
        "timestamp" => $timestamp,
        "unchanged" => true,
        "success" => true
    ]);
    $mysqli->close();
    exit;
}

// Otherwise, fetch the menu items if able to reach server

$stmt = $mysqli->prepare("SELECT * FROM items WHERE is_deprecated = FALSE");
$stmt->execute();
$result = $stmt->get_result();
$items = [];
while ($row = $result->fetch_assoc()) {
    $items[strval($row['id'])] = $row;
}

$response = [
    "timestamp" => $timestamp,
    "items" => json_encode($items),
    "unchanged" => false
];

header('Content-Type: application/json');
echo json_encode($response);

$mysqli->close();
?>