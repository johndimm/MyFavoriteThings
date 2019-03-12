<?php

function getParam($paramName, $defaultValue) {
    return (isset($_GET[$paramName])) ?  $_GET[$paramName] : $defaultValue;
}


function main() {
  include "db.php";
  $db = dbInit();

  $photo_id = getParam('photo_id', '5b2163890fc8c.png');

  $sql = "call delete_review('$photo_id')";
  echo $sql;
  dbGet($db, $sql);

  //echo '<meta http-equiv="refresh" content="0; url=index.html">';
}

main();

?>


