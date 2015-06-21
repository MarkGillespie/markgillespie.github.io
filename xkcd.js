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
		url: "xkcd.php",
		dataType: "json",
		success: function(data) {

			mostRecentXKCD = data.num;
			XKCDindex = data.num;
			//alert(mostRecentXKCD);
			$("#xkcdtitle").empty();
			$("#xkcdtitle").append(
				data.num + ": " + data.title
			);
			$("#xkcdcontent").append(
				$("<a>").attr({
					href: "http://www.xkcd.com"
				}).append(
					$("<img/>").attr({
						src: data.img,
						title: data.alt,
						alt: data.title,
						class: "xkcdImage"
					}),
					$("<div>").append(
						data.alt
					)
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
		url: "xkcd.php?comic=" + n,
		dataType: "json",
		success: function(data) {
			$("#xkcdcontent").empty();
			$("#xkcdtitle").empty();
			$("#xkcdtitle").append(
				data.num + ": " + data.title
			);

			$("#xkcdcontent").append(
				$("<a>").attr({
					href: "http://www.xkcd.com/"+n
				}).append(
					$("<img>").attr({
						src: data.img,
						title: data.alt,
						alt: data.title,
						class: "xkcdImage"
					}),
					$("<div>").append(
						data.alt
					)
				)
			);
		}
	});
	
}

function xkcdMove(n){
	if(XKCDindex + n >= 1 && XKCDindex + n <= mostRecentXKCD){
		loadXKCD(XKCDindex+n);
	} else if(n == 'first'){
		loadXKCD(1);
	} else if(n=='last'){
		loadXKCD(mostRecentXKCD);
	}
}

function xkcdRandom(){
	XKCDindex = Math.floor(Math.random()*mostRecentXKCD);
	loadXKCD(XKCDindex);
}

