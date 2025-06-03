

<?php
    
    $mobile_number = (int)$_GET["mobile-number"];   // Server to execute action url,after the form values sent as key:values under http method variable of url
    $cl_password = $_GET["password"];

    $servername = 'localhost';
    $username = 'root';
    $password = 'root';

    $conn = new mysqli($servername, $username, $password);
    !$conn->connect_error || die("Connection failed: " . $conn->connect_error);
    
    $conn->query("use prodb");

    $result = $conn->query("SELECT (password_) FROM users WHERE mobile_number = " . $mobile_number);

    
    $link = ("Location: ../failure_login.html");

    if ($result->num_rows==0) {         // No previous records
        if ($mobile_number>=1000000000 && $mobile_number<=9999999999) {         
            $conn->query("INSERT INTO users (mobile_number, password_)  VALUES (" . $mobile_number . ", " . $cl_password . ")");
            $link = ("Location: ../account_created.html");
        }
    }
    else {
        $result->data_seek(0);
        $row = $result->fetch_assoc();
        if ($row['password_'] == $cl_password) {
            $link = ("Location: ../success_login.html");
        }
    }
    
    // echo json_encode()
    header($link);
    $conn->close();
?>
