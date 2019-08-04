<?php

define("CHECK", 1);
include "/var/www/html/dashboard/dbconfig.php";

# Open a connection to the database
$con = mysqli_connect($server, $username, $dbpassword, $dbname) or die("Failed to connect!");

$data = mysqli_query($con, $_GET['query']);

while ($row = mysqli_fetch_assoc($data)){
  $response[] = $row;
}

echo json_encode($response);
exit;
?>
