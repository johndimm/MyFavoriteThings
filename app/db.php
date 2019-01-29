<?php

function dbInit() {
  include "configuration.php";

  $config = new Jconfig();
  $mysql_host = $config->host;
  $mysql_user = $config->user;
  $mysql_password = $config->password;
  $mysql_database = $config->db;

  $connection_string = "mysql:host=$mysql_host;dbname=$mysql_database;charset=utf8";

//  print $connection_string;

  // Connecting, selecting database
  $connection = new PDO(
      $connection_string
    , $mysql_user
    , $mysql_password
  );

  return $connection;
}

function dbDone($connection) {
  // Closing connection
  // To close the connection, you need to destroy the object by ensuring that all remaining references to
  // it are deleted--you do this by assigning NULL to the variable that holds the object.
  $connection = null;
}

function dbUpdate($connection, $sql) {
  $result = $connection->query($sql);
  return $connection->lastInsertId();
}

function dbGet($connection, $sql) {
  // Perform SQL query.
  $result = $connection->query($sql);
  $output = '';
  if ($result) {
    $output = $result->fetchAll(PDO::FETCH_ASSOC);
  } else {
    print "failed query: $sql\n";
  }
  return $output;
}


?>
