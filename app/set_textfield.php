<?php

function getParam($paramName, $defaultValue) {
    return (isset($_POST[$paramName])) ?  $_POST[$paramName] : $defaultValue;
}

function main() {
  include "db.php";
  $db = dbInit();

  $value = getParam("value", '4');
  $review_id = getParam("review_id", '85');
  $proc = getParam("proc",'set_stars');

  $sql = "call $proc($review_id, '$value');";

//  echo $sql;
  dbGet($db, $sql);
//  var_dump($_POST);
  echo $sql;
}


main();

?>