//Document ready
$(function() {
  var map;
  var marker;
  var markers = [];
  var circle;
  var circles = [];
  var currentLocation;
  var newCurrLocation;
  var newLat;
  var newLng;
  var latlngArray = [];
  var type = "lighthouse";

  // Lighthouse Labs coordinates
  var coordLH = {
    name: "Lighthoue Labs",
    lat: 49.2818872, 
    long: -123.1081878
  };


  // Build coordinates
  function coord(lat, long) {
    return {lat: lat, lng: long};
  }


  // Used to create a map with center at a given location.
  var createMap = function(coordinates) {
    google.maps.visualRefresh = true;
    var mapOptions = {
      center: coordinates,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoom: 15
    };
    return new google.maps.Map(document.getElementById("map"), mapOptions);
  };


  //Used to add markers to locations.
  var addMarker = function(map, coordinates) {
    var markerOptions = {
      clickable: false,
      map: map,
      position: coordinates
    };
    return new google.maps.Marker(markerOptions);
  };


  //Add a circle to show accuracy of the location.
  var addCircle = function(map, coord, acc) {
    var circleOptions = {
      center: coord,
      clickable: false,
      fillColor: "blue",
      fillOpacity: 0.05,
      map: map,
      radius: acc,
      strokeColor: "blue",
      strokeOpacity: 0.2,
      strokeWeight: 2
    };
    return new google.maps.Circle(circleOptions);
  };


  // Add a speech balloon with InfoWindow and geocoder for address.
  var infoWindowVisible = (function(){
    var curVisible = false;
    return function (visible) {
      if (visible !== undefined) {
        curVisible = visible;
      }
      return curVisible;
    };
  }());
  

  var AddInfoWindowListener = function(map, marker, infoWindow) {
    google.maps.event.addListener(marker, 'click', function(){
      if (infoWindowVisible()) {
        infoWindow.close();
        infoWindowVisible(false);
      } else {
        infoWindow.open(map, marker);
        infoWindowVisible(true);
      }
    });
    google.maps.event.addListener(infoWindow, 'closeclick', function() {
      infoWindowVisible(false);
    });
  };


  var addInfoWindow = function(map, marker, address) {
    var infoWindowOptions = {
      content: address,
      maxWidth: 200
    };
    var infoWindow = new google.maps.InfoWindow(infoWindowOptions);
    AddInfoWindowListener(map, marker, infoWindow);
    return infoWindow;
  };

  
  
  var addGeoCode = function(map, coordinates, marker) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
      location: coordinates
    }, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK && results[0]) {
        marker.setClickable(true);
        addInfoWindow(map, marker, results[0].formatted_address);
      }
    });
  };

  var loadNearby = function (lat, long) {
    var searchURL = "";
    if (type == "lighthouse") {
      searchURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat + ',' + long + '&radius=50000&name=lighthouse&sensor=false&key=AIzaSyAMH3e1p_cn6wTz_Ja7RN3HlcsZTmzNuug&callback=initMap';
    } else if (type == "wasted") {
      searchURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat + ',' + long + '&radius=50000&types=(bar|night_club|liquor_store)&sensor=false&key=AIzaSyAMH3e1p_cn6wTz_Ja7RN3HlcsZTmzNuug&callback=initMap';
    }
    

    $.getJSON(searchURL, function(data) {
      for (var i=0; i < data.results.length; i++) {
        var place = {
          name: data.results[i].name,
          lat: data.results[i].geometry.location.lat,
          long: data.results[i].geometry.location.lng
        };

        var locCoord = coord(place.lat, place.long);
        var locMarker = addMarker(map, locCoord);
        markers.push(locMarker);

        circle = addCircle(map, locCoord, 70);
        circles.push(circle);
        
        addGeoCode(map, locCoord, locMarker);
      }
    });
  };


  function getMoveData() {
    clearMarkers();
    clearCircles();
    currentLocation = map.getCenter();
    newCurrLocation = currentLocation.toString();
    newCurrLocation = newCurrLocation.replace('(', '');
    newCurrLocation = newCurrLocation.replace(')', '');

    latlngArray = newCurrLocation.split(",");
    for (var a in latlngArray) {
            latlngArray[a] = parseFloat(latlngArray[a]);
    }
    newLat = latlngArray[0];
    newLng = latlngArray[1];
    map.setCenter({
        lat : newLat,
        lng : newLng
    });
    
    loadNearby(newLat, newLng);
  }

  function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers = [];
  }  

  function clearCircles() {
    for (var i = 0; i < circles.length; i++) {
      circles[i].setMap(null);
    }
    circles = [];
  }

  // Used to create the map on initialize.
  window.initMap = function() {

    var coordinates = coord(coordLH.lat, coordLH.long);
    map = createMap(coordinates);
    
    marker = addMarker(map, coordinates);
    markers.push(marker);

    circle = addCircle(map, coordinates, 70);
    circles.push(circle);
    
    addGeoCode(map, coordinates, marker);

    
    loadNearby(coordLH.lat, coordLH.long, "lighthouse");

    
    getMoveData();
    google.maps.event.addListener(map, 'dragend', getMoveData);
    

    $(".get-wasted").on('click', function() {
      type = "wasted";
      getMoveData();
    });

    $(".get-lighthouses").on('click', function() {
      type = "lighthouse";
      getMoveData();
    });
  };


});