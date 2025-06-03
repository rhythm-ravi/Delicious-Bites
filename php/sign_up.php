<?php

    session_start();
    include('db.php');

    // $response = array(
    //     "success" => false,
    //     "validMobile" => true,
    //     "validName" => true,
    //     "vaildEmail" => true,
    // );

    // // echo "Hola";
    // // echo json_encode($response);     //DEBUG

    // echo $_SERVER["REQUEST_METHOD"];

    if ($_SERVER["REQUEST_METHOD"] == "POST") {

        $mobile = $_POST['mobile-number'];
        $username = $_POST['username'];
        $email = $_POST['email'];

        $first_name = $_POST['first-name'];
        $last_name = $_POST['last-name'];
        $address = $_POST['address'];
        $password = $_POST['password'];


        $response = array(
            "success" => false,
            "validMobile" => true,
            "validName" => true,
            "validEmail" => true,
        );

        $accountCreatable = true;
        
        $query = "SELECT mobile, username, email_id FROM customers WHERE mobile = ? OR username = ? OR email_id = ?";
        if ($stmt = $mysqli->prepare($query)) {
            $stmt->bind_param('sss', $mobile, $username, $email);
            $stmt->execute();
            $stmt->store_result();

            // if ($stmt->num_rows > 0) {
                $stmt->bind_result($db_mobile, $db_username, $db_email);
                while ($stmt->fetch()) {
                    if ($mobile == $db_mobile) {
                        $response['validMobile'] = false;
                        $accountCreatable = false;
                    }
                    if ($username == $db_username) {   
                        $response['validName'] = false;
                        $accountCreatable = false;
                    };
                    if ($email == $db_email) {
                        $response['validEmail'] = false;
                        $accountCreatable = false;
                    }
                }
        } else {
            echo json_encode($response);
            flush();
            exit();
        }

        // One or more field values already in use
        if ($accountCreatable == false) {
            echo json_encode($response);
            flush();
            exit();
        }

        // Query to create account
        $query = "INSERT INTO customers (username, first_name, last_name, mobile, email_id, password, address) VALUES (?, ?, ?, ?, ?, ?, ?)";

        // success = false while others true means database issue encountered
        if ($stmt = $mysqli->prepare($query)) {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt->bind_param('sssssss', $username, $first_name, $last_name, $mobile, $email, $hashedPassword, $address);
                
            if ($stmt->execute()) {
                $response['success'] = true;
            }
            $stmt->close();
        }

        echo json_encode($response);
        flush();
    }

    $mysqli->close();

?>
