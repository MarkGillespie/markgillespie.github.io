//ask a mathematician


function initializeRSS() {

  $.ajax({
    url: "simpleFeedReader.php?url=http://www.askamathematician.com/feed&type=rss",
    dataType: "json",
    success: function(data) {
      $.each(data, function(i,item) {
        var date = new Date(item.date);
        $("#askamathematician").append(
          $("<a>").attr({
            href: item.link,
            class: "bubbleLink"
          }).append(
            $("<div>").attr({
              class: "bubbleHeader"
            }).append(
              item.title
            )
          ),
          $("<div>").attr({
            class: "rssPreview"
          }).append(
            item.description,
            $("<div>").attr({
              align: "right"
            }).append(
              date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear()
            )
          )
        );
      });
    }
  });

  $.ajax({
    url: "simpleFeedReader.php?url=http://what-if.xkcd.com/feed.atom&type=atom",
    //url: "simpleFeedReader.php?url=http://www.theregister.co.uk/headlines.atom&type=atom",
    dataType: "json",
    success: function(data) {
      $.each(data, function(i,item) {
         //console.log("link" + item.link);
        var date = new Date(item.date);
        $("#whatif").append(
          $("<a>").attr({
            href: item.link,
            class: "bubbleLink"
          }).append(
            $("<div>").attr({
              class: "bubbleHeader"
            }).append(
              item.title
            )
          ),
          $("<div>").attr({
            class: "rssPreview"
          }).append(
            summarize(item.summary, item.content),
            $("<div>").attr({
              align: "right"
            }).append(
              date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear()
            )
          )
        );
      });
    }
  });

}

function summarize(summary, longStr){
  if(summary.length > 0){
    return summary;
  }
  longStr = longStr.replace(/<img.*>/g,"");
  goodStr = "";
  for(var i = 2; i < 3; i++){
    var elem = $(longStr).children("p")[i];
    goodStr += "<p>" + $(elem).html() + "</p>";
  }
  return goodStr;
}

