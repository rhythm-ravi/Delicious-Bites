<?php
    // Define database connection parameters
    $host = 'localhost';  
    $username = 'root';   
    $password = 'root';       
    $database = 'prodb';  // name of db

    // Create the connection using MySQLi
    $mysqli = new mysqli($host, $username, $password, $database);

    if ($mysqli->connect_error) {
        throw new Exception("Database connection failed: " . $mysqli->connect_error);
    }

    // // Optionally, set the character set to UTF-8 to avoid encoding issues
    // $mysqli->set_charset("utf8");

    // conn ready for use
?>