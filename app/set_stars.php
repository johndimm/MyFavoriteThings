<?php

function getParam($paramName, $defaultValue) {
    return (isset($_POST[$paramName])) ?  $_POST[$paramName] : $defaultValue;
}

function main() {
  include "db.php";
  $db = dbInit();

  $value = getParam("value", 'dummy_again');
  $review_id = getParam("review_id", '3');
  $proc = getParam("proc",'');

  $sql = "call $proc($review_id, '$value');";

//  echo $sql;
  dbGet($db, $sql);
//  var_dump($_POST);
  echo $sql;
}


main();

?>