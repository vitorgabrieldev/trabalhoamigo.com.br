<?php
  $hostname = "185.173.111.184";
  $username = "u858577505_trabalho_chat";
  $password = "@#Trabalhoamigo023@_";
  $dbname = "u858577505_trabalho_chat";

  $conn = mysqli_connect($hostname, $username, $password, $dbname);
  if(!$conn){
    echo "Database connection error".mysqli_connect_error();
  }
?>
