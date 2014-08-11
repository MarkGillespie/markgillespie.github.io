//ask a mathematician


function initializeRSS() {

    var feed = new google.feeds.Feed("http://www.askamathematician.com/feed");
    feed.load(function(result) {
        if (!result.error) {
            for (var i = 0; i < result.feed.entries.length; i++) {
                var entry = result.feed.entries[i];
                var date = new Date(entry.publishedDate);
                $("#askamathematician").append(
                    $("<a>").attr({
                        href: entry.link,
                        class: "bubbleLink"
                    }).append(
                        $("<div>").attr({
                            class: "bubbleHeader"
                        }).append(
                            entry.title
                        )
                    ),
                    $("<div>").attr({
                        class: "rssPreview"
                    }).append(
                        entry.contentSnippet,
                        $("<div>").attr({
                            align: "right"
                        }).append(
                            date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear()
                        )
                    )
                );
            }
        }
    });

	feed = new google.feeds.Feed("http://what-if.xkcd.com/feed.atom");
	//feed.includeHistoricalEntries() ;
    feed.load(function(result) {
        if (!result.error) {
        	//alert(result.feed.entries.length);
            for (var i = 0; i < result.feed.entries.length; i++) {
                var entry = result.feed.entries[i];
                var date = new Date(entry.publishedDate);
                $("#whatif").append(
                    $("<a>").attr({
                        href: entry.link,
                        class: "bubbleLink"
                    }).append(
                        $("<div>").attr({
                            class: "bubbleHeader"
                        }).append(
                            entry.title
                        )
                    ),
                    $("<div>").attr({
                        class: "rssPreview"
                    }).append(
                        entry.contentSnippet,
                        $("<div>").attr({
                            align: "right"
                        }).append(
                            date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear()
                        )
                    )
                );
            }
        }
    });

}

