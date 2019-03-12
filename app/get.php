<?php

function getParam($paramName, $defaultValue) {
    return (isset($_GET[$paramName])) ?  $_GET[$paramName] : $defaultValue;
}

function printJSON($db, $sql) {
  // Performing SQL query
  $result = dbGet($db, $sql);

  // print ($sql);

  // header('Content-type: application/json');
  //header('Access-Control-Allow-Origin: *');


  // echo $result;
  echo json_encode($result);
}

function main() {
  include "db.php";
  $db = dbInit();

  $sql = '';

  $proc = getParam('proc', 'get_reviews');
  $param = getParam('param', '');

  $sql = "call $proc('$param')";

 printJSON($db, $sql);
//  echo $sql;
}

main();

?>
