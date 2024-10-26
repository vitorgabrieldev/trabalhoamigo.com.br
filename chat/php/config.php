<?php

  require_once __DIR__ . '/../../config/config.php';

  $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
  if(!$conn){
    echo "Database connection error".mysqli_connect_error();
  }
?>
