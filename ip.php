<?php

define("CHECK", 1);
include "/var/www/html/dashboard/dbconfig.php";

# Open a connection to the database
$con = mysqli_connect($server, $username, $dbpassword, $dbname) or die("Failed to connect!");

$data = mysqli_query($con, 'SELECT IP FROM ssh_logs;');

$ips = [];
while ($row = mysqli_fetch_row($data)) {
	$code = geoip_country_code3_by_name($row[0]);
	if ($code) {
		if (array_key_exists($code, $ips))
			$ips[$code]++;
		else
			$ips[$code] = 1;
	}
}
ksort($ips);

$csv = fopen("/var/www/html/countryCount.csv", "w");

fputcsv($csv, array("Code", "Count"));
foreach ($ips as $key => $value) {
	fputcsv($csv, array($key, $value));
}

fclose($csv);

array_multisort($ips, SORT_DESC);

$ips = array_splice($ips, 0, 10);
$jsonArr = [];

foreach ($ips as $key => $value) {
	$jsonArr[] = array("X" => $key, "Y" => $value);
}

$file = fopen("/var/www/html/topCountries.json", "w");
fwrite($file, json_encode($jsonArr));
fclose($file);

#$country = geoip_country_name_by_name("73.248.206.51");
#if ($country) {
#	echo $country;
#}

?>
