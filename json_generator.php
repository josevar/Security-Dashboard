<?php

define("CHECK", 1);
include "/var/www/html/dashboard/dbconfig.php";

while(file_exists("parser_secure.pid")) {
  sleep(1);
}

# Open a connection to the database
$con = mysqli_connect($server, $username, $dbpassword, $dbname) or die("Failed to connect!");

$dir = "/var/www/html/";
$fileNames = array("IPCount", "DIP", "Failed", "Accepted", "DateTime", "FirstDate", "UserIDCount", "CountByDate");

$queries = array("SELECT IP as X, COUNT(IP) as Y FROM `ssh_logs` GROUP BY IP ORDER BY Y DESC LIMIT 10;", "SELECT COUNT(DISTINCT IP) AS DIP FROM `ssh_logs`;", "SELECT COUNT(StatusCode) AS Failed FROM `ssh_logs` WHERE StatusCode = 'Failed';", "SELECT COUNT(StatusCode) AS Accepted FROM `ssh_logs` WHERE StatusCode = 'Accepted';", "SELECT DateTime FROM `ssh_logs` ORDER BY ID DESC LIMIT 1;", "SELECT DateTime FROM ssh_logs ORDER BY DateTime LIMIT 1;", "SELECT UserID as X, COUNT(UserID) as Y FROM `ssh_logs` GROUP BY UserID ORDER BY Y DESC LIMIT 10;", "SELECT Date(DateTime) as X, COUNT(Date(DateTime)) as Y from ssh_logs GROUP BY Date(DateTime) ORDER BY Date(DateTime);");

for ($i = 0; $i < sizeof($queries); $i++) {
	$data = mysqli_query($con, $queries[$i]);
	
	while ($row = mysqli_fetch_assoc($data)) {
		$response[] = $row;
	}

	$file = fopen($dir . $fileNames[$i] . ".json", "w");
	fwrite($file, json_encode($response));
	fclose($file);
	$response = [];
}

?>
