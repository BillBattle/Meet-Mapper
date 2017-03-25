$(document).ready(function () {

  var database = firebase.database();
  var markerIcons = {
    green: 'http://maps.google.com/mapfiles/ms/icons/grn-pushpin.png',
    purple: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png'
  };
  var markerDataArray = [];
  var placesMarkersArray = [];
  var Map = new GMapInterface('map-container');

  Map.queryUserLocation();
  Map.currentMarker = Map.createMarker(Map.startLoc, {bounce: true});
  Map.currentMarker.setMap(null);
  Map.setMarker(Map.currentMarker);

  Map.map.addListener('click', function(event) {

    Map.currentMarker.setMap(null);
    Map.currentMarker = Map.createMarker(event.latLng, {bounce: true});
    Map.setMarker(Map.currentMarker);

  });

  $('#add-event-button').on('click', function (e) {

    e.preventDefault();

    var newMarkerData = {};

    newMarkerData.name = $('#event-name').val().trim();
    newMarkerData.date = $('#event-date').val().trim();
    newMarkerData.startTime = $('#event-start').val().trim();
    newMarkerData.endTime = $('#event-end').val().trim();
    newMarkerData.location = {lat: Map.currentMarker.position.lat(), lng: Map.currentMarker.position.lng()};


    Map.currentMarker.setMap(null);
    Map.setMarker(Map.createMarker(Map.currentMarker.position, {drop: true}, newMarkerData, markerIcons.green));

    markerDataArray.push(newMarkerData);

    database.ref("events").set(markerDataArray);

  });


  // Search Input Click Event
  $('#search-submit').on('click', function(e){
    e.preventDefault();

    var input = $('#location-search').val().trim();
    
    if(input !== ""){
      var places = new PlacesConstructor(Map); 
      // stores result in a global variable

      places.search(input, outputResults);

      function outputResults(resultArray) {

        if(placesMarkersArray){
          placesMarkersArray.forEach(function (item) {
            item.setMap(null);
          });
          placesMarkersArray = [];
        }

        if(resultArray.length == 1){

          Map.relocateMapMarker(resultArray[0].location);

        }else{

          resultArray.forEach(function(place) {
            var marker = Map.createMarker(place.location, {drop: true}, place, markerIcons.purple);

            marker.addListener('click', function() {

              Map.currentMarker.setMap(null);

              if(Map.activeSelection){
                Map.activeSelection.setAnimation(null);
              }
              marker.setAnimation(google.maps.Animation.BOUNCE);
              Map.activeSelection = marker;

            });

            var infowindow = new google.maps.InfoWindow({
              content: '<img border="0" align="Left" src= ' + marker.data.photo + '>&nbsp' +  marker.data.name
            });

            marker.addListener('mouseover', function () {
              infowindow.open(Map.map, this);
            });

            marker.addListener('mouseout', function () {
              infowindow.close();
            });

            Map.setMarker(marker);
            placesMarkersArray.push(marker);
          });

        }

      }
      
    }

  });

  database.ref("events").once('value', function (snapshot) {
    if(snapshot.val()){
      markerDataArray = snapshot.val();

      markerDataArray.forEach(function (elem) {
        Map.setMarker(Map.createMarker(elem.location, {drop: true}, elem, markerIcons.green));
      });
    }
  });

});