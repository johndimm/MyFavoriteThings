<?php
 
function getParam($paramName, $defaultValue) {
    return (isset($_POST[$paramName])) ?  $_POST[$paramName] : $defaultValue;
}

function printJSON($db, $sql) {
  // Performing SQL query
  $result = dbGet($db, $sql);

  // header('Content-type: application/json');
  // header('Access-Control-Allow-Origin: *');


  // echo dump($result);
  echo json_encode($result);
}

function main() {
  include "db.php";
  $db = dbInit();

  $review_id = getParam("review_id", '1');

  $photo = copyUploadedFile();
  if ($photo == '') {
    $photo = getParam("photo",'fake.jpg');
  }

  $sql = "call set_photo($review_id, '$photo');";

//  echo $sql;
  dbGet($db, $sql);
  echo $photo;
//  var_dump($_POST);

//  echo '<meta http-equiv="refresh" content="0; url=index.html">';
}

function copyUploadedFile() {
  $field_name = "uploaded_file";
  $basename = '';


  if ( array_key_exists($field_name, $_FILES)) {

      $src_file = $_FILES[$field_name]["name"];
      if ($src_file != '') {
          // var_dump($_FILES);
          $tmp_name = $_FILES[$field_name]["tmp_name"];
          $target_dir = "../user_photos/";
          $ext = pathinfo($src_file, PATHINFO_EXTENSION);
          $ext = 'JPG';
          $basename = uniqid() . "." . $ext; // basename($src_file);
          $target_file = $target_dir . $basename;

         // echo "src_file: $src_file, tmp_name: $tmp_name, target_file: $target_file";


          if(move_uploaded_file($tmp_name, $target_file)) {
        //      echo "The file ".  $basename . " has been uploaded";
          } else{
        //      echo "There was an error uploading the file $basename, please try again!";
          }
      }
  }

  // print($basename);

  return $basename;
}

main();

?>
  

