<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$url = "http://xkcd.com/info.0.json";

if(isset($_GET['comic'])){
	$url = "http://xkcd.com/".$_GET['comic']."/info.0.json";
}

echo file_get_contents($url);
?>