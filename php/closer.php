<?php

    // // session_start();
    include('db.php');

    // Get the raw POST data
    $data = json_decode(file_get_contents("php://input"), true);
    $cart = $data['userCart'];
    $user_id = $data['userId'];
    
    // Process data
    $response = ['status' => 'success', 'message' => $cart];
    echo json_encode($response);


    // In a transaction, 1) clear user cart, 2) add values, 3) profit??
    $mysqli->query("START TRANSACTION");
    // delete already present cart, and insert the given values
    $query1 = "DELETE FROM cart_entries WHERE cust_id = ?";
    if ($stmt = $mysqli->prepare($query1)) {
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $stmt->close();
    }
    // Assuming only records with non-zero qties in cart
    $query = "INSERT INTO cart_entries VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE qty = ?";
    foreach ($cart as $item_id => $qty) {
        if ($qty > 0) {         // for now, since I can't figure out how to delete properties in js objs (allowing me to delete corres item entries)
            $response = array('type of key: ' => gettype($item_id), );
            if ($stmt = $mysqli->prepare($query)) {
                $stmt->bind_param('iiii', $item_id, $user_id, $qty, $qty);
                $response = $stmt->execute();
                
                $stmt->close();
            }
            echo json_encode($response);
        }
    }   
    $mysqli->query("COMMIT");

    
    $mysqli->close();

?>
