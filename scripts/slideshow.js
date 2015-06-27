var pics = [];
var index = 0;
var fade_time = 500;
var album_url = "https://api.imgur.com/3/album/8fx1I/images";
var album_length = 0;
var isAnimating = false;

function secure(s) {
  if (s.substring(0,  6) === "https") {
    return s;
  } else {
    return "https:" + s.substring(5);
  }
}

function initialize_imgur() {
  $.ajax({
    type: "GET",
    crossDomain: true,
    url: album_url,
    async: true,
    headers:{
      "Authorization":"Client-ID f000b39b9c57161"
    },
    dataType: "json",
    success: function(data) {
      console.log(data.data);
      album_length = data.data.length;

      $("#slideshow_title_link").attr({
        href: "https://imgur.com/a/8fx1I#" + index,
        style: "text-decoration: none"
      }).append(
        $("<span>").append(
          data.data[index].title
        ).attr({
          class: "slideshow_title"
        })
      );

      var newDiv = $("<div>").attr({
        style: "background-image: url(" + secure(data.data[index].link) + "l);  display: none",
        class: "slideshow_image",
        id: "image_box_2"
      });

      $("#image_container").append(newDiv);

      isAnimating = true;

      var oldDiv = $("#image_box");

      newDiv.fadeIn(fade_time);
      
      oldDiv.fadeOut(fade_time, function () {
        oldDiv.remove();
        isAnimating = false;
      });

      newDiv.attr({
        id: "image_box"
      });
    }
  });
}

function changeImage() {

    if (!isAnimating) {

    $.ajax({
      type: "GET",
      crossDomain: true,
      url: album_url,
      async: true,
      headers:{
        "Authorization":"Client-ID f000b39b9c57161"
      },
      dataType: "json",
      success: function(data) { 
        $("#slideshow_title_link").empty();

        $("#slideshow_title_link").attr({
          href: "https://imgur.com/a/8fx1I#" + index,
          style: "text-decoration: none"
        }).append(
          $("<span>").append(
            data.data[index].title
          ).attr({
            class: "slideshow_title"
          })
        );

        var newDiv = $("<div>").attr({
          style: "background-image: url(" + data.data[index].link + "l);  display: none",
          class: "slideshow_image",
          id: "image_box_2"
        });

        $("#image_container").append(newDiv);

        
        var oldDiv = $("#image_box");

        isAnimating = true;    

        newDiv.fadeIn(fade_time);
        
        oldDiv.fadeOut(fade_time, function () {
          oldDiv.remove();
          isAnimating = false;
        });

        newDiv.attr({
          id: "image_box"
        });

      }
    });
  }
 
}
function prevImage() {
  index--;
  
  if (index < 0) {
    index += album_length;
  }

  changeImage();
}

function  nextImage() {
  index++;
  
  if (index >= album_length) {
    index -= album_length;
  }

  changeImage();
}

function stripExtension(s) {
  return s.substring(0, s.lastIndexOf("."));
}