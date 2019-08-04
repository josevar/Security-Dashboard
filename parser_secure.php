<?php

define("CHECK", 1);
include "/root/dbconfig.php";

$lockFile = fopen("parser_secure.pid", "w");
$log = fopen("parser_secure_state", "c+");
$err = fopen("parser_secure_error", "a");
$filePaths = glob("/var/log/secure*");

usort($filePaths, create_function('$fileOne, $fileTwo', 'return filemtime($fileOne) - filemtime($fileTwo);'));

print_r($filePaths);

$pathCount = count($filePaths);
foreach ($filePaths as $logFilePath) {
	$logFile = fopen($logFilePath, "r");
	rewind($log);
	echo fgets($log) . "\n";
	rewind($log);
	echo sprintf("%'019d\n\n", filemtime($logFilePath));

	if (intval(fgets($log)) <  filemtime($logFilePath)) {
		$fileOffset = intval(fgets($log));
		
        fseek($logFile, 0, SEEK_END);
		if (ftell($logFile) > $fileOffset)
			fseek($logFile, $fileOffset);

		$regex = '/(.*) (\S+) (sshd\S+) (Accepted|Failed|Disconnected|Invalid) [^from](.*)/';

		$con = mysqli_connect($server, $username, $dbpassword, $dbname) or die("Failed to connect!");
		$query = "INSERT INTO ssh_logs (DateTime, StatusCode, UserID, IP, PortNum, LogLine) VALUES ";

		$lineCount = 0;
		while ($line = fgets($logFile)) {
			preg_match($regex, $line, $matches);
			if(count($matches) > 0) {
				$curTime = new DateTime();
				$dateTime = DateTime::createFromFormat('M d H:i:s', $matches[1]);
		
				if (date_format($curTime, 'm') < date_format($dateTime, 'm')) {
					$year = date_format($curTime, 'Y');
					$dateTime = DateTime::createFromFormat('M d H:i:s Y', $matches[1] . " " . ($year - 1));
				}				

				$dateTimeStr = $dateTime->format('Y-m-d H:i:s');
				$query .= "('$dateTimeStr', ";
				if (strcmp($matches[4], "Invalid") == 0) {
					$subMatches = explode(" ", $matches[5]);
					$query .= "'$matches[4]', '$subMatches[1]', '$subMatches[3]',  $subMatches[5], '$matches[0]')";	
				}
				elseif (strcmp($matches[4], "Failed") == 0) {
					$subMatches = explode(" ", $matches[5]);
					if (strpos($matches[5], "invalid")) {
						$query .= "'$matches[4]', '$subMatches[4]', '$subMatches[6]', $subMatches[8], '$matches[0]')";
					}
					else {
						$query .= "'$matches[4]', '$subMatches[2]', '$subMatches[4]', $subMatches[6], '$matches[0]')";
					}
				}
				elseif (strcmp($matches[4], "Accepted") == 0) {
					$subMatches = explode(" ", $matches[5]);
					$query .= "'$matches[4]', '$subMatches[2]', '$subMatches[4]', $subMatches[6], '$matches[0]')";	
				}
				else {
					$subMatches = explode(" ", $matches[5]);
					$query .= "'$matches[4]', '$subMatches[2]', '$subMatches[3]', $subMatches[5], '$matches[0]')";	
				}
				if ($lineCount++ < 1000)
					$query .= ",";
				else {
					$query .= ";";
					$lineCount = 0;
					mysqli_query($con, $query);
					if (mysqli_errno($con)) {
						fwrite($err, "The following query produced an error!\n" . $query . "\n");
						fwrite($err, mysqli_error($con) . "\n\n");
					}
					$query = "INSERT INTO ssh_logs (DateTime, StatusCode, UserID, IP, PortNum, LogLine) VALUES ";
				}
			}
		}
		
		$query = substr($query, 0, -1) . ";";
		echo $query;

		mysqli_query($con, $query);
		if (mysqli_errno($con)) {
			fwrite($err, "The following query produced an error!\n" . $query . "\n");
			fwrite($err, mysqli_error($con) . "\n\n");
		}

		rewind($log);
		fwrite($log, sprintf("%'019d\n", filemtime($logFilePath)));

		if ($pathCount === 1) {
			echo $logFilePath . "\n\n";
			fwrite($log, ftell($logFile) . "\n");
		}
		else
			ftruncate($log, ftell($log));
		rewind($log);
	}
    $pathCount--;
}

fclose($log);
fclose($err);
unlink("parser_secure.pid");

?>
