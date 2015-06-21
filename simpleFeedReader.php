<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

if(isset($_GET['url']) && isset($_GET['type'])){
	$xml = simplexml_load_file($_GET['url']);
	
	if($_GET['type']==='rss'){
		foreach ($xml->channel->item as $rssItem) {
		  $rssEntry = array();
		  $rssEntry['title'] = $rssItem->title->__toString();
		  $rssEntry['description'] = $rssItem->description->__toString();
		  $rssEntry['link'] = $rssItem->link->__toString();
		  $rssEntry['date'] = $rssItem->pubDate->__toString();
		  $rssData[] = $rssEntry;
		}
	} else if($_GET['type']==='atom'){		
		foreach ($xml->entry as $atomItem) {
		  $atomEntry = array();
		  $atomEntry['title'] = $atomItem->title->__toString();
		  $atomEntry['content'] = $atomItem->content->__toString();
		  $atomEntry['summary'] = $atomItem->summary->__toString();
		  $atomEntry['link'] = $atomItem->link->attributes()['href']->__toString();
		  $atomEntry['date'] = $atomItem->updated->__toString();
		  $rssData[] = $atomEntry;
		}
		
	}

echo json_encode($rssData);
}
?>