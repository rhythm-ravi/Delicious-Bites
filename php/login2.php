<?php

    session_start();
    include('db.php');

    if ($_SERVER["REQUEST_METHOD"] == "POST") {

        $mobile = $_POST['mobile-number'];
        $password = $_POST['password'];


        // Query to check the credentials
        $query = "SELECT id, username, password FROM customers WHERE mobile = ?";
        if ($stmt = $mysqli->prepare($query)) {
            $stmt->bind_param('s', $mobile);
            $stmt->execute();
            $stmt->store_result();
            $stmt->bind_result($user_id, $db_username, $db_password);
            $stmt->fetch();
            
            $stmt->close();

            
            if (password_verify($password, $db_password) || $password==$db_password) {      // rn passwords aren't hashed,   hence the OR
                // Password is correct, set session variables
                $_SESSION['user_id'] = $user_id;
                $_SESSION['username'] = $db_username;

                // we need cart entries in response as well
                $query = "SELECT item_id, qty FROM cart_entries WHERE cust_id = ?";
                $stmt = $mysqli->prepare($query);   
                $stmt->bind_param("i", $user_id);
                $stmt->execute(); 
                $result = $stmt->get_result();
                // $items = $result->fetch_all(MYSQLI_ASSOC);
                $items = [0 => 0];      // default item so that array is assoc even when empty
                while ($row = $result->fetch_assoc()) {
                    $items[strval($row['item_id'])] = $row['qty'];
                }

                $response = array(
                    "success" => true,
                    "userId" => $user_id,
                    "userName" => $db_username,
                    "items" => $items,
                );
            } else {
                $response = array(
                    "success" => false,
                );
                // header("Location: ../failure_login.html");
            }
            // exit();
            echo json_encode($response);        // login status, and credentials sent back
            flush();

        } else {
            echo "Error with database query";

        }
    }

    $mysqli->close();

?>
