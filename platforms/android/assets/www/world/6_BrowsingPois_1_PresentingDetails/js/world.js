// implementation of AR-Experience (aka "World")
var World = {
	// you may request new data from server periodically, however: in this sample data is only requested once
	isRequestingData: false,

	// true once data was fetched
	initiallyLoadedData: false,

	// different POI-Marker assets
	markerDrawable_idle: null,
	markerDrawable_selected: null,
	markerDrawable_directionIndicator: null,

	// list of AR.GeoObjects that are currently shown in the scene / World
	markerList: [],

	// The last selected marker
	currentMarker: null,

	locationUpdateCounter: 0,
	updatePlacemarkDistancesEveryXLocationUpdates: 10,

	// called to inject new POI data
	loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {
		AR.context.destroyAll();
		// empty list of visible markers
		World.markerList = [];

		// start loading marker assets
		World.markerDrawable_idle = new AR.ImageResource("assets/note-03.png");
		World.markerDrawable_selected = new AR.ImageResource("assets/note-04.png");
		World.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");

		// loop through POI-information and create an AR.GeoObject (=Marker) per POI
		for (var currentPlaceNr = 0; currentPlaceNr < poiData.length; currentPlaceNr++) {
			var singlePoi = {
				"id": poiData[currentPlaceNr].id,
				"latitude": parseFloat(poiData[currentPlaceNr].latitude),
				"longitude": parseFloat(poiData[currentPlaceNr].longitude),
				"altitude": parseFloat(poiData[currentPlaceNr].altitude),
				"title": poiData[currentPlaceNr].name,
				"address": poiData[currentPlaceNr].address,
				"img": poiData[currentPlaceNr].img,
				"review1": poiData[currentPlaceNr].review1,
				"review2": poiData[currentPlaceNr].review2,
				"rating": poiData[currentPlaceNr].rating,
				"description": poiData[currentPlaceNr].description
			};

			World.markerList.push(new Marker(singlePoi));
		}

		// updates distance information of all placemarks
		World.updateDistanceToUserValues();
		
		World.updateStatusMessage(currentPlaceNr + ' places loaded');
	},

	// sets/updates distances of all makers so they are available way faster than calling (time-consuming) distanceToUser() method all the time
	updateDistanceToUserValues: function updateDistanceToUserValuesFn() {
		for (var i = 0; i < World.markerList.length; i++) {
			World.markerList[i].distanceToUser = World.markerList[i].markerObject.locations[0].distanceToUser();
		}
	},

	// updates status message shon in small "i"-button aligned bottom center
	updateStatusMessage: function updateStatusMessageFn(message, isWarning) {

		var themeToUse = isWarning ? "e" : "c";
		var iconToUse = isWarning ? "alert" : "info";

		$("#status-message").html(message);
		$("#popupInfoButton").buttonMarkup({
			theme: themeToUse
		});
		$("#popupInfoButton").buttonMarkup({
			icon: iconToUse
		});
	},

	// location updates, fired every time you call architectView.setLocation() in native environment
	locationChanged: function locationChangedFn(lat, lon, alt, acc) {

		// request data if not already present
		if (!World.initiallyLoadedData) {
			World.requestDataFromLocal(lat, lon);
			World.initiallyLoadedData = true;
		} else if (World.locationUpdateCounter === 0) {
			// update placemark distance information frequently, you max also update distances only every 10m with some more effort
			World.updateDistanceToUserValues();
		}

		// helper used to update placemark information every now and then (e.g. every 10 location upadtes fired)
		World.locationUpdateCounter = (++World.locationUpdateCounter % World.updatePlacemarkDistancesEveryXLocationUpdates);
	},

	// fired when user pressed maker in cam
	/*onMarkerSelected: function onMarkerSelectedFn(marker) {

		// deselect previous marker
		if (World.currentMarker) {
			if (World.currentMarker.poiData.id == marker.poiData.id) {
				return;
			}
			World.currentMarker.setDeselected(World.currentMarker);
		}

		// highlight current one
		marker.setSelected(marker);
		World.currentMarker = marker;
	},*/


	// fired when user pressed maker in cam
	onMarkerSelected: function onMarkerSelectedFn(marker) {
		World.currentMarker = marker;

		/*
			In this sample a POI detail panel appears when pressing a cam-marker (the blue box with title & description), 
			compare index.html in the sample's directory.
		*/
		// update panel values
		$("#poi-detail-title").html(marker.poiData.title);
		$("#poi-detail-description").html(marker.poiData.description);
		$("#poi-detail-address").html(marker.poiData.address);

		// distance and altitude are measured in meters by the SDK. You may convert them to miles / feet if required.
		var distanceToUserValue = (marker.distanceToUser > 999) ? ((marker.distanceToUser / 1000).toFixed(2) + " km") : (Math.round(marker.distanceToUser) + " m");

		$("#poi-detail-distance").html(distanceToUserValue);

		$("#poi-detail-img").attr("src", marker.poiData.img);

		$("#poi-detail-review1").html(marker.poiData.review1);
		$("#poi-detail-review2").html(marker.poiData.review2);
		$("#poi-detail-rating").html(marker.poiData.rating);

		// show panel
		$("#panel-poidetail").panel("open", 123);

		$(".ui-panel-dismiss").unbind("mousedown");

		// deselect AR-marker when user exits detail screen div.
		/*$("#panel-poidetail").on("panelbeforeclose", function(event, ui) {
			World.currentMarker.setDeselected(World.currentMarker);
		});*/

		$("#close_btn").click(function() {
  			World.currentMarker.setDeselected(World.currentMarker);
  			$("#panel-poidetail").panel("close");
		});

		$("#panel-poidetai").panel({
          swipeClose: false
        });
		
		$("#donav_btn").click(function() {
			$("#stop_nav").show();
			$("#right-panel").show();
  			World.currentMarker = marker;
  			$("#panel-poidetail").panel("close");
		});
	},

	getMaxDistance: function getMaxDistanceFn() {

		// sort palces by distance so the first entry is the one with the maximum distance
		World.markerList.sort(World.sortByDistanceSortingDescending);

		// use distanceToUser to get max-distance
		var maxDistanceMeters = World.markerList[0].distanceToUser;

		// return maximum distance times some factor >1.0 so ther is some room left and small movements of user don't cause places far away to disappear.
		return maxDistanceMeters * 10.1;
	},

	/*
		In case the data of your ARchitect World is static the content should be stored within the application. 
		Create a JavaScript file (e.g. myJsonData.js) where a globally accessible variable is defined.
		Include the JavaScript in the ARchitect Worlds HTML by adding <script src="js/myJsonData.js"/> to make POI information available anywhere in your JavaScript.
	*/

	// request POI data
	requestDataFromLocal: function requestDataFromLocalFn(lat, lon) {

		//var poisNearby = Helper.bringPlacesToUser(myJsonData, lat, lon);
		//World.loadPoisFromJsonData(poisNearby);

		/*
		For demo purpose they are relocated randomly around the user using a 'Helper'-function.
		Comment out previous 2 lines and use the following line > instead < to use static values 1:1. 
		*/

		//staat in apparte json file
		World.loadPoisFromJsonData(myJsonData);
	},
	// helper to sort places by distance
	sortByDistanceSorting: function(a, b) {
		return a.distanceToUser - b.distanceToUser;
	},

	// helper to sort places by distance, descending
	sortByDistanceSortingDescending: function(a, b) {
		return b.distanceToUser - a.distanceToUser;
	},

	/*onNavigateClicked: function onMarkerSelectedFn(marker) {

		// deselect previous marker
		if (World.currentMarker) {
			if (World.currentMarker.poiData.id == marker.poiData.id) {
				return;
			}
			World.currentMarker.setDeselected(World.currentMarker);
		}

		// highlight current one
		marker.setSelected(marker);
		World.currentMarker = marker;

		//nav details + UI changes

		//show distance + stop
		//hide rest UI
	},*/

	// screen was clicked but no geo-object was hit
	onScreenClick: function onScreenClickFn() {
		if (World.currentMarker) {
			World.currentMarker.setDeselected(World.currentMarker);
		}
	},

};

var Helper = {

	/* 
		For demo purpose only, this method takes poi data and a center point (latitude, longitude) to relocate the given places randomly around the user
	*/
	bringPlacesToUser: function bringPlacesToUserFn(poiData, latitude, longitude) {
		for (var i = 0; i < poiData.length; i++) {
			poiData[i].latitude = latitude + (Math.random() / 5 - 0.1);
			poiData[i].longitude = longitude + (Math.random() / 5 - 0.1);
			/* 
			Note: setting altitude to '0'
			will cause places being shown below / above user,
			depending on the user 's GPS signal altitude. 
				Using this contant will ignore any altitude information and always show the places on user-level altitude
			*/
			poiData[i].altitude = AR.CONST.UNKNOWN_ALTITUDE;
		}
		return poiData;
	}
}


/* forward locationChanges to custom function */
AR.context.onLocationChanged = World.locationChanged;

/* forward clicks in empty area to World */
AR.context.onScreenClick = World.onScreenClick;