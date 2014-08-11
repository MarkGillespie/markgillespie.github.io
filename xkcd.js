$(document).ready(function() {
    $(".xkcdtext").keyup(function(event) {
        if (event.keyCode == 13) {
        	var str = document.getElementById("xkcdindex").value;
        	if(!isNaN(str)){
        		//alert("goto");
        		if(isValidComicIndex(parseInt(str))){
        			loadXKCD(parseInt(str));
        			document.getElementById("xkcdindex").value="";
        		}
        	} else {
        		//alert("nope");
        	}
         }
    });
});

//xkcd
function loadCurrentXKCD(){
	$.ajax({
		url: "https://dynamic.xkcd.com/api-0/jsonp/comic?callback=?",
		dataType: "json",
		jsonpCallback: "xkcddata",
		success: function(data) {
			mostRecentXKCD = data.num;
			XKCDindex = data.num;
			//alert(mostRecentXKCD);
			$("#xkcdtitle").append(
				$("<h1/>").text(data.num + " " + data.title)
			);
			$("#xkcdcontent").append(
				$("<a>").attr({
					href: "http://www.xkcd.com"
				}).append(
					$("<img/>").attr({
						src: data.img,
						title: data.alt,
						alt: data.title,
						style : "max-width:100%"
					})
				)
			);
		}
	});
}

function isValidComicIndex(n){
	if(n===parseInt(n) && n > 0 && n <= mostRecentXKCD){
		return true;
	} else {
		return false;
	}
}

function loadXKCD(n){  
	XKCDindex = n; 		
	$.ajax({	
		url: "https://dynamic.xkcd.com/api-0/jsonp/comic/" + n + "?callback=?",
		dataType: "json",
		jsonpCallback: "xkcddata",
		success: function(data) {
			$("#xkcdcontent").empty();
			$("#xkcdtitle").empty();
			$("#xkcdtitle").append(
				$("<h1/>").text(data.num + " " + data.title)
			);

			$("#xkcdcontent").append(
				$("<a>").attr({
					href: "http://www.xkcd.com/"+n
				}).append(
					$("<img>").attr({
						src: data.img,
						title: data.alt,
						alt: data.title,
						style : "max-width:100%"
					})
				)
			);
		}
	});
	
}

function xkcdMove(n){
	if(XKCDindex + n >= 0 && XKCDindex + n <= mostRecentXKCD){
		loadXKCD(XKCDindex+n);
	}
}

function xkcdRandom(){
	XKCDindex = Math.floor(Math.random()*mostRecentXKCD);
	loadXKCD(XKCDindex);
}

