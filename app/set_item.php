<?php

function getParam($paramName, $defaultValue) {
    return (isset($_POST[$paramName])) ?  $_POST[$paramName] : $defaultValue;
}

function main() {
  include "db.php";
  $db = dbInit();

  $place = getParam("value", 'dummy_again');
  $review_id = getParam("review_id", '3');

  $sql = "call set_item($review_id, '$place');";

//  echo $sql;
  dbGet($db, $sql);
//  var_dump($_POST);
  echo $sql;
}


main();

?>