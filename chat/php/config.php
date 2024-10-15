<?php
  $hostname = "185.173.111.184";
  $username = "u858577505_trabalhoamigo";
  $senha = "@#Trabalhoamigo023@_";
  $dbname = "u858577505_trabalhoamigo";

  $conn = mysqli_connect($hostname, $username, $senha, $dbname);
  if(!$conn){
    echo "Database connection error".mysqli_connect_error();
  }
?>
