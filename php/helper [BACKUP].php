

<?php
    $servername = 'localhost';
    $username = 'root'; # server side script, hence root user
    $password = 'root';

    $conn = new mysqli($servername, $username, $password);
    if ($conn->connect_error)
        die("Connection failed: " . $conn->connect_error);
    
    $conn->query("use prodb");
    $result = $conn->query("SELECT * FROM items WHERE avail=true");
    $response = $result->fetch_all(MYSQLI_ASSOC);

    // $response = array();
    // while($row = $result->fetch_assoc()) {
    //     $response[] = array('id' => $row['id'], 'name' => $row['name'], 'price' => $row['price']);
    // }

    echo json_encode($response);
    flush();

    $conn->close();
    // return $response;
?>



<?php
    include('db.php');
    
    $result = $mysqli->query("SELECT * FROM items WHERE avail=true");
    $response = $result->fetch_all(MYSQLI_ASSOC);

    // $response = array();
    // while($row = $result->fetch_assoc()) {
    //     $response[] = array('id' => $row['id'], 'name' => $row['name'], 'price' => $row['price']);
    // }

    echo json_encode($response);
    flush();

    $mysqli->close();
    // return $response;
?>