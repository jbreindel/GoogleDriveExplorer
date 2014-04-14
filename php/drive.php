<?php
/*********************************************************************
 *
 * FILE:				drive.php
 * AUTHOR:			Jake Breindel
 * DATE:				4-7-2014
 *
 * DESRIPTION:
 * 	Drive endpoint for accessing the drive api.
 *
 **********************************************************************/

// You'll want to include security here
require('main.inc.php');

// IF this for a specific file
if($_GET['file']){
	$page='drive-file.inc.php';
}
// ELSE show the list page
else{
	$page='drive.inc.php';	
}

require(STAFFINC_DIR.'header.inc.php');
require(STAFFINC_DIR.$page);
include(STAFFINC_DIR.'footer.inc.php');

?>
