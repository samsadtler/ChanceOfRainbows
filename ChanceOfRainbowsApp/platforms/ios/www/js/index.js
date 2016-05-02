/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var screenHeight;
var precipitationChance;
var precipitationIntensity;
var windSpeed;
var sunCondition;
var sunAngle;
var cloudCover;
var forecastObject;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        alert('app.init')
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('deviceready', this.getLocation, false);
        // document.addEventListener('deviceready', this.touchHandler, false);
    },
    // deviceready Eventvent Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //app setup
        app.receivedEvent('deviceready');
        screenHeight= screen.height;
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('retrieve event')
    },
    eventTiming: function(e){

    },
    touchHandler: function(e){
        console.log("start touchHandler")
        var mobileUI = document.getElementById('mainer')
        var starty = 0
        var dist = 0
        var touchState = false
        var positiveDirect = false
        mobileUI.addEventListener('touchstart', function(e){
            console.log('starttouch')
            var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
            starty = parseInt(touchobj.clientY) // get x position of touch point relative to left edge of browser
            e.preventDefault()
        }, false)

        mobileUI.addEventListener('touchmove', function(e){
            var touchobj = e.changedTouches[0] // reference first touch point for this event
            var dist = parseInt(touchobj.clientY) - starty
            // console.log("move dist " + dist) 
            touchState = true;
            // if (dist > 50 ) {
            //     app.fadeEvent(starty, dist);
            //     console.log('down touch detected') 
            // }
            // else if (dist < -50 ) {   
            //     app.fadeEvent(starty, dist);
            //     console.log('up touch detected')             
            // }
            e.preventDefault()
        }, false)

        mobileUI.addEventListener('touchend', function(e){
            var touchobj = e.changedTouches[0] // reference first touch point for this event
            var dist = parseInt(touchobj.clientY) - starty
             console.log("move dist " + dist)
            if (dist > 110 ) {
                app.fadeEvent(starty, dist);
                console.log('down touch detected' , e) 
            }
            else if (dist < -110 ) {   
                app.fadeEvent(starty, dist);
                console.log('up touch detected' , e)             
            }
           e.preventDefault()
        }, false)
        //  jQuery('ul').on('tap', 'img', function(){
        //     console.log("tap it baby")                 
        // });
    },
    fadeEvent: function( touchStart, touchDist){
        console.log('dist received')
        var arrowToFade = document.querySelector(".arrow");
        // var elementToFade = document.querySelector(".question");
        var cardToFade = document.querySelector(".card-holder");
        var windowHeight = window.innerHeight;
        console.log ('window Height',  windowHeight)
        var start = touchStart;
        var delta = touchDist;
        if(delta < 600){
          opacityVal = windowHeight/screenHeight;  
        }
        if(delta > 600){
          opacityVal = delta/screenHeight;  
        }
        console.log("scroll value = " + top);
        console.log("opacity value = " + opacityVal);
        if (opacityVal > .1 && opacityVal < 1){
            arrowToFade.style.opacity = opacityVal;
            // elementToFade.style.opacity = opacityVal;
            cardToFade.style.opacity = 1/opacityVal;
        } 
        if (opacityVal >= 1){
            arrowToFade.style.opacity = 0.0;
            // elementToFade.style.opacity = 0.0;
            // cardToFade.style.opacity = 1.0;
        } 
        else {
            arrowToFade.style.opacity = 1.0;
            // elementToFade.style.opacity = 1.0;
            cardToFade.style.opacity = 0.0;
        }
    },
    geometryPowerHorizon: function(alt){
        // console.log('geometryPower now')
        //calculates the visible horizon based on current altitude
        // in order to compare it with the sun angle
        var R = 6371000;// earths radius (m)
        var ph = 1.7;// average person height (m) 
        var a =  alt; // altitude of observer (m)
        var h = ph + a; // height of observer (m)
        var d =  Math.sqrt(h*(2*R+h)); //distance to horizon (m)
        var cosOfµ = (Math.pow((R+h),2)+Math.pow(d,2)-Math.pow(R,2))/(2*(R+h)*d);
        var µ = Math.acos(cosOfµ); // this is the angle of the observer to the horizon (rad)
        console.log('cosOfµ = ', cosOfµ);
        console.log('µ : ', µ,'rad', 'alt: ', a,'m');
        var angOfHorz = 180/Math.PI*µ 
        return angOfHorz

    },
    suncalcRequest: function(lat, lng, yearmonthday, alt){
        var localhost = "https://chanceofrainbows.herokuapp.com";
        //need sunset
        console.log('request --> lat: ', lat,'lng: ', lng, 'date: ', yearmonthday);
        dataArray = {
            'lat': lat,
            'lng': lng,
            'date': yearmonthday
        }
        jQuery.ajax({
                url : localhost + '/api/get/',
                type : 'get',
                data : dataArray,
                dataType : 'json',
                success : function(response) {

                    console.log("calculation response", response);
                    sunAngle = response.degrees;
                    var observerAngle = app.geometryPowerHorizon(alt);
                    console.log('angles returned: ' , sunAngle , '<- sun --- observer -> ' ,observerAngle)
                    app.referenceComparison(sunAngle, observerAngle);
                },
                error: function(response){
                    console.log('fuck beans we botched the request to the server')
                }           

        })
    },
    chanceOfRainbows: function(precipitationChance, cloudCover){
        console.log('lets calculate the chanceofrainbows!')
        var rainbowChance;
        var shortAnswer;
        var longAnswer;
        var outcome;
        var answerArray;
        jQuery.ajax({
            url: './data/answers.json',
            type: 'GET',
            failure: function(err){
                return console.log ("There was an issue getting the data");
            },
            success: function(response) {
                window.out = $.parseJSON(response);
                console.log('the response from answers.json is -- >' , window.out);
                // console.log(out);
                
            if (sunCondition){
                rainbowChance = "at least its the right time of day!";
                if (cloudCover > .9 && precipitationChance < .1) {
                    console.log("don't count on it")
                    rainbowChance = "Don't Hold Your Breath";
                    outcome = window.out.answer.cloudy;
                } 
                if (cloudCover < .9 && precipitationChance > .1) {
                    console.log('10%')
                    rainbowChance = "10%";
                     outcome = window.out.answer.lowest;
                } 
                if (cloudCover < .8 && precipitationChance > .2) {
                    console.log('20%')
                    rainbowChance = "20%";
                     outcome = window.out.answer.low;
                } 
                if (cloudCover < .7 && precipitationChance > .3) {
                    console.log('30%')
                    rainbowChance = "30%";
                    outcome = window.out.answer.low;
                } 
                if (cloudCover < .6 && precipitationChance > .4) {
                    console.log('40%')
                    rainbowChance = "40%";
                    outcome = window.out.answer.medium;
                }  
                if (cloudCover < .5 && precipitationChance > .5) {
                    console.log('50%')
                    rainbowChance = "50%";
                    outcome = window.out.answer.medium;
                }
                if (cloudCover < .4 && precipitationChance > .6) {
                    console.log('60%')
                    rainbowChance = "60%";
                    outcome = window.out.answer.high;
                }
                if (cloudCover > .3 && precipitationChance > .7) {
                     console.log('70%')
                    rainbowChance = "70%";
                    outcome = window.out.answer.high;
                }
                if (cloudCover < .2 && precipitationChance > .8) {
                    console.log('higher chance of rainbows')
                    rainbowChance = "80%";
                    outcome = window.out.answer.high;
                }
                if (cloudCover < .1 && precipitationChance > .9) {
                     console.log('90!%')
                    rainbowChance = "90%";
                    outcome = window.out.answer.highest;
                }
                if (cloudCover < .1 && precipitationChance > .95) {
                     console.log('95!%')
                    rainbowChance = "95%";
                    outcome = window.out.answer.highest;
                } else {
                    console.log('not looking good')
                    outcome = window.out.answer.lowest
                }
            answerArray = outcome.response;
            shortAnswer = answerArray[0];
            longAnswer = answerArray[app.getRandomInt(1, answerArray.length)]
            return app.addCard(rainbowChance, shortAnswer, longAnswer)
            }
            
            if(!sunCondition) {
                if(sunAngle < 0){
                    answerArray = window.out.answer.night.response;
                shortAnswer = answerArray[0];
                longAnswer = answerArray[app.getRandomInt(1, answerArray.length)]
                rainbowChance = "Try again tomorrow!";
                return app.addCard(rainbowChance, shortAnswer, longAnswer)
                }
                else {
                    answerArray = window.out.answer.midday.response;
                    shortAnswer = answerArray[0];
                    longAnswer = answerArray[app.getRandomInt(1, answerArray.length)]
                    rainbowChance = "Try again later in the day!";
                    return app.addCard(rainbowChance, shortAnswer, longAnswer)
                }
            }
            console.log('sunCondition: ', sunCondition, "cloudCover: ", cloudCover, "precipitationChance: ", precipitationChance )
            console.log("The chanceofrainbows is, ", rainbowChance)
        }
         
        
        });
    },
    referenceComparison: function(sunAngle, observerAngle){
        var rainbowAngle = 42.3; // angle of rainbow from shadow hypotenuse (deg)
        console.log('comparison commence sunAngle vs observerAngle:', sunAngle,'vs ', observerAngle , ' rainbow', observerAngle+rainbowAngle)   
        if(sunAngle < (observerAngle + rainbowAngle) && sunAngle > 0){
            console.log('Theresome chance of rainbow!')
            return sunCondition = true;

        }
        if(sunAngle > (observerAngle + rainbowAngle) || sunAngle < 0){
            console.log('Theres NO chance of rainbow! :-(')
            return sunCondition = false;
        }
    },
    getLocation: function() {
        console.log('see if location is a thing')
        var date = '2013-03-05UTC';
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position){
                console.log('get location')
                console.log('detected coordinate data is --> ', position);
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                var alt = position.coords.altitude;
                var time = position.coords.timestamp;
                console.log('time: ', time);
                app.getTheWeatherAPI("Current Location", lat, lng);
                app.suncalcRequest(lat, lng, date, alt);
            });
        } else {
            return alert("Geolocation is not supported by this browser.");
        }
    },
    getTheWeatherAPI: function(location, lat, lon){
        console.log('getTheWeatherAPI')
        //forecast apiKey
        var apiKey = "a345a0f8bba13003d1bb79fa4fad60d6";

        // make a request to get the current weather details for the lat/lon
        jQuery.ajax({
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
              var precipitationChance = response.daily.data[0].precipProbability;
              var cloudCover = response.daily.data[0].cloudCover;
              // reset the input value
              // document.getElementById("theInput").value = '';
              console.log("Got the chance " + precipitationChance);
              // add the card
              forecastObject = response;

              return app.chanceOfRainbows(precipitationChance, cloudCover, temp)
              // app.doINeedAnUmbrella(location, status, temp, precipitationChance)
              // return app.doINeedAnUmbrella(location, status, temp, chance);
            }
        });
    },

    doINeedAnUmbrella: function(location, status, temp, chance){
        console.log('getting some sweet answers', 'location: ', location, "status: ", status, "temp: ", temp, "chance: ", chance)
        var icon;
        var shortAnswer;
        var longAnswer;
        var outcome;
        var answerArray;
        jQuery.ajax({
            url: './data/answers.json',
            type: 'GET',
            failure: function(err){
                return console.log ("There was an issue getting the data");
            },
            success: function(response) {
                window.out = $.parseJSON(response);
                console.log('the response from answers.json is -- >' , window.out);
                // console.log(out);
                if (chance <= .20) {
                    console.log(window.out.answer.lowest)
                    outcome = window.out.answer.lowest;
                } 
                if (chance > .20 && chance <= .40) {
                    outcome = window.out.answer.low;
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
                longAnswer = answerArray[app.getRandomInt(1, answerArray.length)]
                console.log("random value = " + app.getRandomInt(1, answerArray.length) + " and Array length " + answerArray.length + " and answerArray[0] = " + answerArray[0]);
                return app.addCard(location, status, temp, icon, shortAnswer, longAnswer)
                }
        }); 
    },

    addCard: function(rainbowChance, shortAnswer, longAnswer){
        jQuery('.short-answer').text(shortAnswer);
        var chanceToAppend =  
            '<p class=" text-centered rainbow-chance">'+ rainbowChance +'</p>';      
        
        jQuery('.rainbow-chance').append(chanceToAppend);
        var chevronToAppend =  
            '<i class="arrow chevron fa fa-chevron-down text-centered" aria-hidden="true"></i>';      
        jQuery('.chevron').append(chevronToAppend);
       
        var htmlToAppend = 
        '<div class="card-container col-sx-12 centered">'+
            '<div class="card">'+
                    // '<img src="img/'+icon+'" class="img-responsive">'+
                '<h1 class="long-answer">'+longAnswer+'</h1>'+
          '</div>'+
        '</div>';
        jQuery('.card-holder').append(htmlToAppend);
    },

    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
 
};