var testCourse ={};
var closeCourses={};
var xhttp = new XMLHttpRequest();
var response={};
//Cali
//var local_obj = {latitude: 38.860573,longitude: -121.529398,radius: 100}
//Me Utah
var local_obj = {latitude: 40.4426135,longitude: -111.8631116,radius: 100};

$(document).ready(function() {
    "use strict";
    $.ajax("https://golf-courses-api.herokuapp.com/courses", {
        type: "POST",
        success: function(response){
            response = JSON.parse(response);
            for (var p in response.courses){
                var thisCourse = "<div id='" + response.courses[p].id + "' class='thisCourse' onclick='getCourseInfo(this.id)'>" + response.courses[p].name + "</div>";
                $("#selectCourse").append(thisCourse);

            }
            $("#doDiv").show();
        },
        error: function (request,errorType,errorMessage){
            $("#selectCourse").append(errorMessage);
        },
        timeout: 9000,
        beforeSend: function(){
            $("#selectCourse").append("<img src='../src/images/svg/golfClub.svg' class='is-loading' id='golfLoading'>");
            $("#golfLoading").animate({"transform": "rotate(360deg)"},'fast');
        },
        complete: function(){
            $("#golfLoading").remove();
        },
        data: {"latitude": 40.4426135,"longitude": -111.8631116,"radius": 100}
    });
});


$(document).ready(function(){
    var scoreCard = $("#scoreCard");
    scoreCard.on('focus','.scoreParContainer',function() {
        currentColor = $(this).css('border-color');
        $(this).css({"border-color": "rgba(0,255,0,0.90)"});
    });
    scoreCard.on('focusout','.scoreParContainer',function() {
        $(this).css({"border-color": currentColor});
    });
});

$(document).ready(function(){
    var currentColor,
        scoreCard = $("#scoreCard"),
        outRow = '',
        player ='',
        backOutRow;
    scoreCard.on('change','.holeScoreRow',function(){
        outRow = this.id.substr(0,7) + "out";
        backOutRow = this.id.substr(0,7) + "backOut";
        var score = +$(this).val();
        if ($(this).data("edited") == true){
            if ($(this).val() != ''){
                $(this).css("background-color", "rgba(255,0,0,0.60)")
            }
        } else {
            $(this).attr("data-edited","true");
        }
        if (this.id.length <= 16){
            player = this.id.substr(0,this.id.length - 1);
            var col = Number(this.id.substr(this.id.length - 1));
            if (col <=8){
                updateIn(player,outRow);
            } else {
                updateOut(player,backOutRow);
            }
        } else {
            player = this.id.substr(0,this.id.length - 2);
            updateOut(player,backOutRow);
        }

    });
});


$(document).ready(function() {
    $("#scoreCard").on("click",".infoImg",function(){
        $( "div[id*='holeInfo']" ).slideToggle();
        // console.log($( "span[id*='holeInfo']" ).css({"height": "20px","width": "20px", "background-color": "red", "z-index": "2000"}));
    });

});

var numHoles;
function getCourseInfo(id) {
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            testCourse = JSON.parse(xhttp.responseText);
            numHoles = testCourse.course.hole_count;
            buildPage(numHoles);
        }
    };
    xhttp.open("GET","https://golf-courses-api.herokuapp.com/courses/" + id,true);
    xhttp.send();
}


function buildPage(numHoles) {
    "use strict";
    vertText("Map");
    var scC = $("#scoreCard");
    $("#slideButton").show();
    $("#slideWeather").show().hover( function() {
        $("#weatherContainer").slideToggle();
    });
    $("#courseContainer").slideUp();
    $("#courseStats").show().hover( function() {
        $("#courseContainer").slideToggle();
    }).on('click',courseStats());
    //getMyInfo(testCourse.course.zip_code.substr(0,5));
    getMyInfo();
    $("#selectCourse").remove();
    //$("#doDiv").css("display","none");
    $("#addPlayerBtn").show();
    $("#courseName").html(testCourse.course.name);
    $("#newCourse").css("display","block");
    $("#theCity").append(testCourse.course.city + ", " + testCourse.course.state_or_province);
    $("#phoneNumber").append(testCourse.course.phone);
    $("#site a").attr("href",testCourse.course.website).text(testCourse.course.name);

    var playerCol = "<div id='playerCol' class='playerCol'></div>";
    scC.append(playerCol);
    var holeRowTitle = "<div class='playerCell' id='holeTitle'>Hole</div>";
    $("#playerCol").append(holeRowTitle);
    var holeInfoTitle = "<div class='holeInfo' id='holeInfo'>HCP.</div>";
    $("#playerCol").append(holeInfoTitle);
    var parRowTitle = "<span class='playerCell'>Par</span>";
    $("#playerCol").append(parRowTitle);
    for (var j = 0; j < numHoles; j++ ) {
        var hole = j + 1;
        if (j == 9){
            var outCell = "<div class='outCell'>In</div>",
                outCol = "<div class='holeCol' id='outCol'></div>",
                blankOutCell = "<div id='blankOut' class='outCell'></div>";
            scC.append(outCol);
            $("#outCol").append(outCell).append(blankOutCell);
        }
        var holeColTitleRow = "<span class='holeColTitleRow' id='hole" + hole + "'>" + hole + "</span>",
            holeInfoRow = "<div class='holeInfo' id='holeInfo" + hole + "'></div>",
            holeColId = 'column' + j,
            holeColParRow = "<span class='parRowPro'>" + testCourse.course.holes[j].tee_boxes[0].par + "</span>",
            holeCol = "<div id='" + holeColId + "' class='holeCol'></div>";
        scC.append(holeCol);
        $("#" + holeColId).append(holeColTitleRow).append(holeInfoRow).append(holeColParRow);
        $("#hole" + hole).append(holeInfoRow);
        var teeInfo = testCourse.course.holes[j].tee_boxes;
        for(var info in teeInfo){
            console.log(teeInfo[info]);
            if(!teeInfo[info].tee_type.includes("auto")){
                $("#holeInfo" + hole).append("<div style='z-index: 100'>" + teeInfo[info].tee_type.substr(0,3) + ": " + teeInfo[info].hcp + "</div>");
            }
        }

    }
    $("#holeTitle").append("<div class='infoImg'></div>");
    var totalCol = "<div id='totalColumn' class='holeCol'></div>",
        totalCell = "<div class='outCell'></div>",
        totalTitle = "<div class='outCell'>Total</div>",
        backOutCell = "<div class='outCell'></div>",
        backOutCol = "<div id='backOutCol' class='holeCol'></div>",
        backOutTitle = "<div class='outCell'>Out</div>";
    scC.append(backOutCol).append(totalCol);
    $("#backOutCol").append(backOutTitle).append(backOutCell);
    $("#totalColumn").append(totalTitle).append(totalCell);
    setTimeout(function () {
            getMapCoord();
        },250
    );
}
var numPlayers = 0,
    players = [],
    allTees;
function addTeeBoxes(){
    //testCourse.course.holes[k].tee_boxes[players[numPlayers - 1].level].tee_type
    allTees = testCourse.course.holes[0].tee_boxes;
    for (var t in allTees) {
        var teeType = testCourse.course.holes[t].tee_boxes[t].tee_type;
        if (!teeType.includes("auto")) {
            var teeBox = toCapitalize(teeType);
            document.getElementById('teeDrop').innerHTML += '<option value=\"' + t + '\">' + teeBox + '</option>';
            //console.log("tee: " + teeBox + " option: " + t);
        }
    }
}

function newCourse() {
    window.location.reload();
}

function addPlayer(){
    numPlayers ++;
    var totalCell = "<div class='outCell' id='player" + numPlayers + "total'>0</div>";
    backOut = "<div class='outCell'>31</div>";
    var level = $("#teeDrop").val(),
        newName = $("#playerName").val(),
        handicap = $("#handicap").val();
    players.push({name: newName, level: level, handicap: handicap});
    var thisPlayerOut = "player" + numPlayers + "out",
        thisPlayer = "player" + numPlayers,
        playerName ="<span class='playerCell'>" + players[numPlayers -1].name + "</span>";
    $("#playerCol").append(playerName);
    for (var k = 0; k < testCourse.course.hole_count; k++) {
        if (k == 9){
            var outCell = "<div class='outCell' id='player" + numPlayers + "out'>0</div>";
            $("#outCol").append(outCell);
        }
        var playerPar = testCourse.course.holes[k].tee_boxes[players[numPlayers - 1].level].yards,
            playerOut = "player" + numPlayers,
            playerLevelPar = "<div class='playerPar'>" + playerPar + "</div>",
            scoreParContainerId = 'player' + numPlayers + 'container' + k,
            scoreParContainer = "<div class='scoreParContainer' id='" + scoreParContainerId + "'></div>",
            holeScoreRowId = 'player' + numPlayers + 'scoreCol' + k,
            teeColor = testCourse.course.holes[k].tee_boxes[players[numPlayers - 1].level].tee_hex_color,
            teeType = testCourse.course.holes[k].tee_boxes[players[numPlayers - 1].level].tee_type,
            backOutCell = "<div id='" + playerOut + "backOut' class='outCell'>0</div>";
        $("#column" + k).append(scoreParContainer);
        $("#" + scoreParContainerId).append(playerLevelPar).append("<input class='holeScoreRow' id='" + holeScoreRowId + "'>");
        if (teeType == 'men') {
            $("#" + scoreParContainerId).css({"color": "black", "border": "solid 2px black","background-color": teeColor});
            $("#" + holeScoreRowId).css({"color": "black","border-left": "solid 2px black"});
        } else {
            $("#" + scoreParContainerId).css({"color": "white", "border": "solid 2px ghostWhite","background-color": teeColor});
            $("#" + holeScoreRowId).css({"color": "ghostWhite","border-left": "solid 2px ghostWhite"});
        }
    }
    $("#totalColumn").append(totalCell);
    $("#backOutCol").append(backOutCell);
    $("#playerName").val('');
    $("#teeDrop").html('');
    $("#handicap").val('');
}

function updateIn(player,row) {
    "use strict";
    var outScore = 0;
    for (var pt = 0; pt < numHoles / 2; pt++) {
        var score = +$("#" + player + pt).val();
        if (score !== ''){
            outScore += score;
        }
    }
    $("#" + row).html(outScore);
    updateTotal(player.substr(0,7) + "total",player);
}

function updateOut(player,row) {
    "use strict";
    var outScore = 0;
    for (var pt = 9; pt < numHoles; pt++) {
        var score = +$("#" + player + pt).val();
        if (score !== ''){
            outScore += score;
        }
    }
    $("#" + row).html(outScore);
    updateTotal(player.substr(0,7) + "total",player);
}

function updateTotal(playerTotal,playerCol){
    "use strict";
    console.log(playerCol);
    var totalScore = 0;
    for (var tt = 0; tt < numHoles; tt++) {
        var score = +$("#" + playerCol + tt).val();
        if (score !== ''){
            totalScore += score;
        }
    }
    $("#" + playerTotal).html(totalScore);
}

function toCapitalize(v) {
    "use strict";
    return v.charAt(0).toUpperCase() + v.slice(1);
}


// Slide stuff

function vertText(textVert){
    document.getElementById("btnTxt").innerHTML ='';
    for (var p = 0; p < textVert.length; p++) {
        document.getElementById("btnTxt").innerHTML += "<span>" + textVert[p] + "</span>"
    }
}
function slideBtn() {
    secondSlidePos = $('#secondSlide').position();
    if (secondSlidePos.left > 0) {
        $("#slideButton").css({"padding-top": '20px',"height": "75%"});
        $("#firstSlide").css({"left": "100%", "opacity": "0"});
        $("#secondSlide").css({"left": "0","opacity": "1"});
        vertText("Course");
    } else {
        $("#slideButton").css({"padding-top": '50px',"height": "100%"});
        $("#firstSlide").css({"left": "0", "opacity": "1"});
        $("#secondSlide").css({"left": "100%","opacity": "0"});
        vertText("Map");
    }
}


// Google Map API stuff

var lat = 40.397;
var lng = -111.863;
var map;
function initMap(lat,lng) {
    // Create a map object and specify the DOM element for display.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.397, lng: -111.863},
        scrollwheel: true,
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });

}


var xhttpMap= new XMLHttpRequest();
var holeLocations = [];

function getMapCoord() {

    for (var g in testCourse.course.holes) {
        // console.log(testCourse.course.holes[g].green_location.lat);
        holeLocations.push({greenLat: testCourse.course.holes[g].green_location.lat, greenLng: testCourse.course.holes[g].green_location.lng,teeLat: testCourse.course.holes[g].tee_boxes[0].location.lat,teeLng: testCourse.course.holes[g].tee_boxes[0].location.lng});
        //  console.log(holeLocations[g].lat + " & " + holeLocations[g].lng);
        document.getElementById("column" + g).setAttribute('onclick','reCenterMap(' + holeLocations[g].greenLat + ',' + holeLocations[g].greenLng + ')');
        //console.log("Green: " + holeLocations[g].greenLat + " & " + holeLocations[g].greenLng + "\nTee: " + holeLocations[g].teeLat + " & " + holeLocations[g].teeLng);

    }
    var courseLat = testCourse.course.location.lat;
    var courseLng = testCourse.course.location.lng;
    map.setCenter({lat: courseLat,lng: courseLng});
    reCenterMap(courseLat,courseLng);
}


function reCenterMap(lat,lng) {
    "use strict";
    map.setCenter({lat: lat,lng: lng});
    var marker = new google.maps.Marker({
        position: {lat: lat,lng: lng},
        map: map,
        title: 'Hello World!'
    });
}



//weather API Call
var xhttpWeather;
var weatherObject = {};
var weatherIcon = "../src/images/svg/";

function courseStats() {
    "use strict";
    var addIt = document.getElementById('courseContainer');
    var line = document.createElement("span");
    line.setAttribute('id','statsList');
    var cc = testCourse.course;
    addIt.appendChild(line);
    document.getElementById('statsList').innerHTML += "somethin";
    $("#statsList").html("Membership: " + toCapitalize(cc.membership_type) + "<br>");
    $("#statsList").append("Holes: " + cc.hole_count + "<br>");
    $("#statsList").append("Global Rank: " + cc.global_rank + "<br>");
    $("#statsList").append("Local Rank: " + cc.local_rank + "<br>");
    $("#statsList").append("Tee Types:<br>");
    for (var g = 0; g < cc.tee_types.length; g++) {
        $("#statsList").append(toCapitalize(cc.tee_types[g].tee_type) + "<br>");
    };
    if (cc.fees != undefined) {
        $("#statsList").append("Fees: " + cc.fees);
    };
};


function getMyInfo() {
    var zipCode = $("#zipCode").val();
    $.ajax('http://api.openweathermap.org/data/2.5/weather', {
        success: function(response) {
            var windSpeed = Math.ceil(response.wind.speed);
            clearWeather();
            $("#cityName").append(response.name);
            var temperature = response.main.temp;
            $("#humidity").append(response.main.humidity);
            $("#temp").append(temperature.toFixed(0));
            $("#temp img").first().attr("src","../src/images/svg/farenheit.svg");
            $("#wind").append(windSpeed).append("<img src''>");
            if (windSpeed > 0 && windSpeed <= 12 ) {
                $("#wind img").attr('src','../src/images/svg/wind-3.svg')
            } else if (windSpeed > 12 && windSpeed <= 18) {
                $("#wind img").attr('src','../src/images/svg/wind-4.svg')
            } else if (windSpeed > 18) {
                $("#wind img").attr('src','../src/images/svg/weather-1.svg')
            }
            $("#icon img").first().attr("src", weatherIcon + response.weather[0].icon + ".svg");
            $("#weatherDesc").html(toCapitalize(response.weather[0].description));
        },
        data: {"zip": testCourse.course.zip_code.substr(0,5) ,"appid": "a4e12bc54b22227bd03bb03c867242d7","units": "imperial"},
        error: function (request,errorType,errorMessage){
            $("#cityName").append(errorMessage);
        },
        timeout: 3000,
        beforeSend: function(){
            $("#slideWeather").css({"background-color": "red","color": "black"})
        },
        complete: function(){
            $("#slideWeather").css({"background-color": "transparent", "color": "ghostWhite"})
        }
    });
}


function clearWeather() {
    "use strict";
    $("#weatherContainer > div").not('#icon').html('');
    $('#temp img').append('img src="../src/images/svg/farenheit.svg"');
    $("#icon img").attr('src','');
}

function newZip () {
    "use strict";
    var thisZip = $("#zipCode").val();
    getMyInfo(thisZip);
};