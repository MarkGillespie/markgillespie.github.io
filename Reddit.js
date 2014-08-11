//reddit
                    //AskHistorians,   knitting,   crochet,  diy,   woodworking,   somethingimade,   askreddit,   unexpected,   math
var subredditArray = [true,             true,       true,    true,  true,          true,             true,        true,         true,   true,         true,         true     ]; //(12)
var subredditNames = ["AskHistorians", "knitting", "crochet","diy", "woodworking","math",  "askreddit","unexpected", "somethingimade", "askphysics", "askscience", "jamesandted"];
var mostRecentXKCD, XKCDindex;

function setUpRedditCheckboxes(){
    $("#redditCheckboxes").append(
        $("<table>").attr({
            class: "invisibleTable",
            id: "redditCheckTable"
        })
    );
    var width = 3;
    var height = parseInt(subredditArray.length/width);

    $("#redditCheckTable").attr({
        style: "max-width: 100%"
    }).append(
        $("<tr>").attr({
            id: "row_0"
        }).append(
            $("<td>").attr({
                class:"invisibleTableCell",
                rowspan:height
            }).append(
                $("<a>").attr({
                    href: "http://www.reddit.com"
                }).append(
                    $("<img>").attr({
                        src: "lilsnoo.png"
                    })
                )
            )
        )
    );
    for(var y = 0; y < height; y++){
        for(var x = 0; x < width; x++){
            $("#row_" + y).append(
                $("<td>").attr({
                    class:"invisibleTableCell",
                }).append(
                    $("<div>").attr({
                        class: "roundedOne"
                    }).append(
                        $("<input>").attr({
                            type:"checkbox",
                            id:x+width*y,
                            onclick:"toggleSubreddit(" + (x+width*y) +")",
                            checked:subredditArray[x + width*y]
                        }),
                        $("<label>").attr({
                            for: x+width*y
                        })
                    )
                ),
                $("<td>").attr({
                    class:"invisibleTableCell",
                }).append(
                    $("<a>").attr({
                        href: "http://www.reddit.com/r/" + subredditNames[x + width*y],
                        class: "subredditLink"
                    }).append(
                        subredditNames[x + width*y]
                    )
                )
            )
        }
        if( y < height-1){
            $("#redditCheckTable").append(
                $("<tr>").attr({
                    id: "row_" + (y+1)
                })
            )
        }
    }

}

function timeAgo(utc){
    var now = new Date();

    var d = new Date(0);
    d.setUTCSeconds(utc);

    if(now.getYear() - d.getYear() > 0){
        return (now.getYear() - d.getYear()) + " years ago";
    } else if(now.getMonth() - d.getMonth() > 0){
        return (now.getMonth() - d.getMonth()) + " months ago";
    } else if(now.getDate() - d.getDate() > 0){
        return (now.getDate() - d.getDate()) + " days ago";
    } else if(now.getHours() - d.getHours() > 0){
        return (now.getHours() - d.getHours()) + " hours ago";
    } else {
        return (now.getMinutes() - d.getMinutes()) + " minutes ago";
    }

}

var goodExtensions = ['.jpg', '.jpeg', '.gif', '.bmp', '.png']
function isValidImage(url) {
    var dotLocation = url.lastIndexOf('.');
    if (dotLocation < 0) {
        return false;
    }
    var extension = url.substring(dotLocation);

    if (goodExtensions.indexOf(extension) >= 0) {
        return true;
    } else {
        return false;
    }
}

function toggleSubreddit(n){
    timeAgo(7);
    subredditArray[n] = !subredditArray[n];
    updateReddit();
}

function updateReddit(){
    var url = "https://www.reddit.com/r/";
    var subcounter = 0;
    for(i = 0; i < subredditArray.length; ++i){
        if(subredditArray[i] == true){
            url = url + subredditNames[i] + "+";
            subcounter = subcounter+1;
        }
    }
    //alert(url + " " + subcounter);
    if(subcounter > 0){
        url = url.substring(0, url.length-1);
    } else {
        url = "https://www.reddit.com/";
    }
    
    loadReddit(url);
}

function loadReddit(str){
    $.ajax({
        url: str + "/.json?limit=15",
        dataType: "json",
        jsonpCallback: "redditdata",
        success: function(data) {
            $("#reddit").empty();
            $.each(data.data.children, function(i,item) {
                
                var nsfw = "";
                if(item.data.over_18){
                    nsfw = "[NSFW]";
                }

                if(item.data.thumbnail.length===0 || (!isValidImage(item.data.thumbnail) && item.data.thumbnail != "self")){
                    $("#reddit").append(
                        $("<div>").attr({
                            class:"invisibleTableCell",
                            style: "max-width: 100%"
                        }).append(
                            $("<a>").attr({
                                 href: item.data.url,
                                 class: "bubbleLink"
                            }).append(
                                $("<div>").attr({
                                    class: "bubbleHeader"
                                }).append(
                                    $("<div>").attr({
                                    class: "redditPost"
                                    }).append(
                                        item.data.title + "   " + nsfw,
                                        "<br>",
                                        $("<div>").attr({
                                            align: "right"
                                        }).append(
                                            $("<a>").attr({
                                                href: "http://www.reddit.com" + item.data.permalink,
                                                class:'redditCommentLink'
                                            }).append(
                                                item.data.subreddit + " | " + item.data.num_comments + " comments | posted " + timeAgo(item.data.created_utc)
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    );                                    
                        
                    
                } else {

                    var imgPath;
                    if(item.data.thumbnail === "self"){
                        imgPath = "self.png";
                    } else {
                        imgPath = item.data.thumbnail;
                    }
                    $("#reddit").append(
                        $("<div>").attr({
                            class:"invisibleTableCell"
                        }).append(
                            $("<a>").attr({
                                 href: item.data.url,
                                 class: "bubbleLink"
                            }).append(
                                $("<div>").attr({
                                    class: "bubbleHeader"
                                }).append(
                                    $("<table>").attr({
                                        class:"invisibleTable"
                                    }).append(
                                        $("<tr>").append(
                                            $("<td>").attr({
                                                class:"invisibleTableCell"
                                            }).append(
                                                $("<a>").attr({
                                                    href: item.data.url
                                                }).append(
                                                    $("<img>").attr({
                                                        src:imgPath,
                                                        class: "icon"
                                                    })
                                                )
                                            ),
                                            $("<td>").attr({
                                                class:"invisibleTableCell"
                                            }).append(
                                                $("<div>").attr({
                                                    class: "redditPost"
                                                }).append(
                                                    item.data.title + "   " + nsfw,
                                                    "<br>",
                                                    $("<div>").attr({
                                                        align: "right"
                                                    }).append(
                                                        $("<a>").attr({
                                                            href: "http://www.reddit.com" + item.data.permalink,
                                                            class:'redditCommentLink'
                                                        }).append(
                                                             item.data.subreddit + " | " + item.data.num_comments + " comments | posted " + timeAgo(item.data.created_utc)
                                                        )
                                                    )
                                                )
                                            )  
                                        )
                                    )
                                )
                            )
                        )                                    
                        
                    );
                }
            })
        }
    });
}   
