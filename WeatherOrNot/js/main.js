function init() {
	getLocation();
	setHeight();
	var opacityVal = 1;
	function setHeight() {
		$('#main-container').height(window.innerHeight);
	}
	// window.addEventListener('scroll', fadeEvent());

	window.addEventListener("scroll", function(event) {
  		var	arrowToFade = document.querySelector(".arrow");
  		var	elementToFade = document.querySelector(".question");
  		var cardToFade = document.querySelector(".card-holder");
  		var topMax = 40;
	    var top = this.scrollY,
	        left = this.scrollX;
 		opacityVal = top/topMax;
 		console.log("scroll value = " + top);
 		console.log("opacity value = " + opacityVal);
 		if (opacityVal > .1 && opacityVal < 1){
	  		arrowToFade.style.opacity = opacityVal;
	  		elementToFade.style.opacity = opacityVal;
	  		cardToFade.style.opacity = 1/opacityVal;
	  	} 
	  	if (opacityVal >= 1){
	  		arrowToFade.style.opacity = 0.0;
	  		elementToFade.style.opacity = 0.0;
	  		cardToFade.style.opacity = 1.0;
	  	} 
	  	else {
	  		arrowToFade.style.opacity = 1.0;
	  		elementToFade.style.opacity = 1.0;
	  		cardToFade.style.opacity = 0.0;
	  	}

	}, false);

}

function fadeEvent(event) {
	

}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
        	console.log('detected position is --> ' + position);
        	var lat = position.coords.latitude;
        	var lon = position.coords.longitude;
        	console.log(lat + ' ' + lon);
        	getTheWeatherAPI("Current Location", lat, lon);
        	// geoCodeIt();
        });
    } else {
        return alert("Geolocation is not supported by this browser.");
    }
}

function geoCodeIt(location){
	console.log("geoCodeIt");
	var apiKey = 'AIzaSyCIxywgknotMlV6Kjqn-HbJgQBkSAMPOlU';

	// make a request to geocode the location
	$.ajax({
	    url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+location+'&key='+apiKey,
	    type: 'GET',
	    failure: function(err){
	    	return alert ("Could not find that location");
	    },
	    success: function(response) {
	      console.log('the geocode response is -- >');
	      console.log(response);
	      
	      if(response.status=="ZERO_RESULTS") return alert ("Could not find that location");

	      // now that we have the lat/lon details, can get the weather
	      var lat = response.results[0].geometry.location.lat;
	      var lon = response.results[0].geometry.location.lng;
	      return getTheWeatherAPI(location, lat, lon);
	    }
	});
}

function getTheWeatherAPI(location, lat, lon){

	//forecast apiKey
	var apiKey = "a345a0f8bba13003d1bb79fa4fad60d6";

	// make a request to get the current weather details for the lat/lon
	$.ajax({
	    url: 'https://api.forecast.io/forecast/'+apiKey+'/'+lat+','+lon,
	    type: 'GET',
	    dataType: "jsonp", // need to specify this
	    success: function(response) {
	      console.log('the weather response is -- >');
	      console.log(response);
	      // now that we have the weather details, we can build the card
	      var status = response.currently.summary;
	      var temp = Math.round(response.currently.temperature);
	      // var icon = response.currently.icon;
	      var chance = response.daily.data[0].precipProbability;

	      // reset the input value
	      // document.getElementById("theInput").value = '';
	      console.log("Got the chance " + chance);
	      // add the card
	      return doINeedAnUmbrella(location, status, temp, chance);
	    }
	});

}
function doINeedAnUmbrella(location, status, temp, chance){
	var icon;
	var shortAnswer;
	var longAnswer;
	var outcome;
	var answerArray;
	$.ajax({
	    url: './data/answers.json',
	    type: 'GET',
	    failure: function(err){
	    	return console.log ("There was an issue getting the data");
	    },
	    success: function(response) {
	    	console.log('the response from answers.json is -- >');
	    	console.log(response);
			if (chance <= .20) {
				outcome = response.answer.lowest;
			} 
			if (chance > .20 && chance <= .40) {
				outcome = response.answer.low;
			}
			if (chance > .40 && chance <= .60) {
				outcome = response.answer.medium;
			}
			if (chance > .60 && chance <= .80) {
				outcome = response.answer.high;	
			}
			if (chance > .80) {
				outcome =response.answer.highest;
			}
			answerArray = outcome.response;
			icon = outcome.icon;
			shortAnswer = answerArray[0];
			longAnswer = answerArray[getRandomInt(1, answerArray.length)]
			console.log("random value = " + getRandomInt(1, answerArray.length) + " and Array length " + answerArray.length + " and answerArray[0] = " + answerArray[0]);
			return addCard(location, status, temp, icon, shortAnswer, longAnswer)
			}
	});	
}

function addCard(location, status, temp, icon, shortAnswer, longAnswer){


	$('.short-answer').text(shortAnswer);
	var chevronToAppend = 
		'<ul class="down-arrow col-sx- centered">'+
          '<li>'+
              '<i class=" fa fa-chevron-down" >'+'</i>'+
          '</li>'+
        '</ul>';
    $('.arrow').append(chevronToAppend);   
	var htmlToAppend = 
	'<div class="card-container col-sx- centered">'+
		'<div class="card">'+
		        '<img src="img/'+icon+'">'+
		    '<h1>'+longAnswer+'</h1>'+
	  '</div>'+
	'</div>';
	$('.card-holder').append(htmlToAppend);
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
// on page load, let's get the user's location from the browser
window.addEventListener('onload', init());

