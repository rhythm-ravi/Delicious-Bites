<?php
    include('db.php');
    
    // $result = $mysqli->query("SELECT * FROM items WHERE availability=true");
    // $response = $result->fetch_all(MYSQLI_ASSOC);
    
    $stmt = $mysqli->prepare("SELECT * FROM items");
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $response[strval($row['id'])] = $row;  // redundant id, but still fine
    }    
    echo json_encode($response);
    flush();

    $mysqli->close();       // close the connection after each exec
    // return $response;
?>