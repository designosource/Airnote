//https://developers.google.com/maps/documentation/directions/
//https://developers.google.com/maps/documentation/directions/intro
//http://stackoverflow.com/questions/16256885/google-map-directions-on-phonegap-mobile-application
//http://stackoverflow.com/questions/18028666/senduseractionevent-is-null

//default (if location is not found / user denied permission)
//coordinaten van kruidtuin om toch te kunnen testen
var user_latitude = "51.024211";
var user_longitude = "4.4822998";

$( document ).ready(function() {
    $("#stop_nav").on("click", function() {
        $(this).hide();
        $("#right-panel").hide();
        World.currentMarker.setDeselected(World.currentMarker);
    });
});

//navigator.geolocation.getCurrentPosition(onSuccess, onError);

    // onSuccess Geolocation
    //
    function onSuccess(position) {
        user_latitude = position.coords.latitude;
        user_longitude = position.coords.longitude;

        alert(user_latitude,user_longitude);
    }

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

function initMap() {
        var directionsDisplay = new google.maps.DirectionsRenderer;
        var directionsService = new google.maps.DirectionsService;
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 7,
          center: {lat: 41.85, lng: -87.65}
        });
        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('right-panel'));

        var control = document.getElementById('floating-panel');
        control.style.display = 'block';
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);

        /*var onChangeHandler = function() {
          calculateAndDisplayRoute(directionsService, directionsDisplay);
        };
        document.getElementById('start').addEventListener('change', onChangeHandler);
        document.getElementById('end').addEventListener('change', onChangeHandler);*/

        $("#donav_btn").click(function() {
            calculateAndDisplayRoute(directionsService, directionsDisplay);
        });
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  var start = "Lange Ridderstraat 44, 2800 Mechelen";
  //var start = ReverseGeocode(user_latitude, user_longitude);
  var end = $('#poi-detail-address').text();
  directionsService.route({
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.WALKING
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function ReverseGeocode(lat, lon){
    var reverseGeocoder = new google.maps.Geocoder();
    var currentPosition = new google.maps.LatLng(lat, lon);
    reverseGeocoder.geocode({'latLng': currentPosition}, function(results, status) {
 
            if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                    //alert(results[0].formatted_address);
                    return results[0].formatted_address;
                    }
            else {
                    alert('Unable to detect your address.');
                    }
        } else {
            alert('Unable to detect your address.');
        }
    });
}


//was ff een try, niet op letten
/*var map,
                currentPosition,
                directionsDisplay,
                directionsService;

            function initialize(lat, lon) {
                directionsDisplay = new google.maps.DirectionsRenderer();
                directionsService = new google.maps.DirectionsService();

                currentPosition = new google.maps.LatLng(lat, lon);

                //2D map setup
                map = new google.maps.Map(document.getElementById('map_canvas'), {
                    zoom: 15,
                    center: currentPosition,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });

                directionsDisplay.setMap(map);

                var currentPositionMarker = new google.maps.Marker({
                    position: currentPosition,
                    map: map,
                    title: "Current position"
                });

                var infowindow = new google.maps.InfoWindow();
                google.maps.event.addListener(currentPositionMarker, 'click', function () {
                    infowindow.setContent("Current position: latitude: " + lat + " longitude: " + lon);
                    infowindow.open(map, currentPositionMarker);
                });
            }

            function locSuccess(position) {
                initialize(position.coords.latitude, position.coords.longitude);
            }

            function calculateRoute() {
                var targetDestination = $("#target-dest").val();
                if (currentPosition && currentPosition != '' && targetDestination && targetDestination != '') {
                    var request = {
                        origin: currentPosition,
                        destination: targetDestination,
                        travelMode: google.maps.DirectionsTravelMode["WALKING"]
                    };

                    directionsService.route(request, function (response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            directionsDisplay.setPanel(document.getElementById("directions"));
                            directionsDisplay.setDirections(response);

                            /*
                            var myRoute = response.routes[0].legs[0];
                            for (var i = 0; i < myRoute.steps.length; i++) {
                                alert(myRoute.steps[i].instructions);
                            }
                        
                            $("#results").show();
                        } else {
                            $("#results").hide();
                        }
                    });
                } else {
                    $("#results").hide();
                }
            }

            $(document).on('click', '#donav_btn', function (e) {
                e.preventDefault();
                calculateRoute();
            });

            var showGeolocationInfo = function() {
                navigator.geolocation.getCurrentPosition(locSuccess, locError);
            }
            function init(){
                document.addEventListener("deviceready", showGeolocationInfo, true);
            }

<div class="ui-bar-c ui-corner-all ui-shadow" style="padding:1em;">
                <div id="map_canvas" style="height:350px;"></div>
            </div>

         <div id="results" style="display:none;">
                    <div id="directions"></div>
         </div>

         <div data-role="fieldcontain" data-theme="d">
                <input type="text" name="target-dest" id="target-dest" value="13002 Rivers Bend Road, Chester, VA"  />
            </div>

            */



