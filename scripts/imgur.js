imageIndex = 0;
numImages = 16;
carouselLength = 5;

function loadImage(n) {

  source = "";

  $.ajax({
    type: "GET",
    crossDomain: true,
    url: "https://api.imgur.com/3/album/8fx1I/images",
    async: true,
    headers:{
      "Authorization":"Client-ID f000b39b9c57161"
      // "Authorization":"Bearer 6a85a3daa0bde0e11bb7d3eaac9619e09e723c3f"
    },
    dataType: "json",
    success: function(data) {
      $("#photo").empty();
      $("#photo").append(
        $("<div>").attr({
          class: "photobox"
        }).append(
          $("<img>").attr({
            src: thumbnail(data.data[n].link, "h"),
            class: "viewing",
            onclick: "loadImage(" + (n + 1 + numImages)%numImages + ")"
          })
        ),
        $("<font>").attr({
          class: "smallTitle"
        }).append(
          data.data[n].title
        )
      );

      $("#carousel").empty();

      $("#carousel").append(
        $("<img>").attr({
          class: "carousel",
          src: "previous.png",
          onclick: "loadImage(" + (n - 1 + numImages)%numImages + ")"
        })
      );



      for(i = Math.ceil(-carouselLength/2); i <= Math.floor(carouselLength/2); i++) {   
        if(i != 0){
          $("#carousel").append(
            $("<img>").attr({
              class: "carousel",
              src: thumbnail(data.data[(i + n + numImages)%numImages].link, "s"),
              onclick: "loadImage(" + (i + n + numImages)%numImages + ")"
            })
          );
        } else {
          $("#carousel").append(
            $("<img>").attr({
              class: "carouselCenter",
              src: thumbnail(data.data[(i + n + numImages)%numImages].link, "s"),
              onclick: "loadImage(" + (i + n + numImages)%numImages + ")"
            })
          );
        }
        
      }

      $("#carousel").append(
        $("<img>").attr({
          class: "carousel",
          src: "next.png",
          onclick: "loadImage(" + (n + 1 + numImages)%numImages + ")"
        })
      );

    }
  });
}

function loadAllImages() {

  source = "";

  var images = [];

  $.ajax({
    type: "GET",
    crossDomain: true,
    url: "https://api.imgur.com/3/album/8fx1I/images",
    async: true,
    headers:{
      "Authorization":"Client-ID f000b39b9c57161"
      // "Authorization":"Bearer 6a85a3daa0bde0e11bb7d3eaac9619e09e723c3f"
    },
    dataType: "json",
    success: function(data) {
      for (var i = 0; i < data.data.length; i++) {
        // alert(data.data[i].link);
        images[i] = data.data[i].link;
      }
    }
  });
  console.log(images);
  return images;
}

function thumbnail(str, size) {
  return str.substring(0, str.length-4) + size + str.substring(str.length-4, str.length);
}

function imgurAlbum(n) {
  if(!(imageIndex + n <0 || imageIndex + n >=  numImages)){
    imageIndex +=  n;
  }
  loadImage(imageIndex);
}

function max(a, b) {
  if(a > b) {
    return a;
  }

  return b;
}


//https://imgur.com/?state = aaa#access_token = 6a85a3daa0bde0e11bb7d3eaac9619e09e723c3f&expires_in = 3600&token_type = bearer&refresh_token = c3cf11320bc6beac7b7e6c82efa61dfc210857f0&account_username = ConstantiusChlorus
