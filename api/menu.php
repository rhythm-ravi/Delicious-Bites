<?php
    include('../php/db.php');
    
    // Fetch menu timestamp
    $timestampStmt = $mysqli->prepare("SELECT last_updated FROM menu WHERE id = 1");
    $timestampStmt->execute();
    $timestampResult = $timestampStmt->get_result();
    $menuTimestamp = $timestampResult->fetch_assoc()['last_updated'];
    
    // Fetch items where is_deprecated = false
    $stmt = $mysqli->prepare("SELECT * FROM items WHERE is_deprecated = false");
    $stmt->execute();
    $result = $stmt->get_result();
    
    $items = array();
    while ($row = $result->fetch_assoc()) {
        $items[strval($row['id'])] = $row;  // keyed by id as string for consistency
    }
    
    // Prepare response
    $response = array(
        'timestamp' => $menuTimestamp,
        'items' => $items
    );
    
    // Set content type and return JSON
    header('Content-Type: application/json');
    echo json_encode($response);
    flush();

    $mysqli->close();
?>