# security-dashboard

This project was created as part of an independent study and Senior research by Jose Varela at Kean University.

## PHP Files in Root of Project

The following files should go in the root user's home folder:

* ip.php
* parser_secure.php
* json_generator.php

The first two should be executed periodically using cron. Use the dbconfig.php file in the dashboard folder as a template for another such file to be stored in the root user's home folder. That way, the files in the root folder can have "INSERT" privileges, but those can be removed from the dashboard.

The remaining files go in the webroot of the web server you are using. Ideally configure your server so that access to the dashboard folder requires a username and password, as it is possible to run queries using that folder.

A table called "ssh_logs" is expected by the file "parser_secure.php". If a different table name is desired, modify the file.
