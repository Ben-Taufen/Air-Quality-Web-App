
var airQualityApp = angular.module('airQualityApp',[]);
var lnglat;
var lat = 44.976877256928;
var lng = -93.17484381979153;
var radius = 8300;


airQualityApp.controller('tableController',function($scope, $http){
	//
  var google_wait = setInterval(() => {
    if (map !== undefined) {
      clearInterval(google_wait);
          // Create the search box and link it to the UI element.
          var input = document.getElementById('pac-input');
          var searchBox = new google.maps.places.SearchBox(input);
          map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
          map.addListener('dragend', function(){
            //updateLnglat(map.getCenter());
            lnglat = map.getCenter();
            radius = getBoundsRadius(map.getBounds());
            if(lnglat!=null){
              lat=lnglat.lat();
              lng=lnglat.lng();
            }
              $http.get("https://api.openaq.org/v1/measurements?coordinates="+lat+","+lng+"&radius="+radius).then(
                function(response)
                {

                  var results = response.data.results;
                  $scope.tableData = response.data.results;
                  var i = 0;
                  for(i=0;i<results.length;i++){
                    curLat = results[i].coordinates.latitude;
                    curLng = results[i].coordinates.longitude;
                    markers.push(new google.maps.Marker({
                      map: map,
                      title: "Location: " + results[i].location +
                      "\nDate: "+results[i].date.local+
                      "\nParticle: "+results[i].parameter+
                      "\nMeasurement: "+results[i].value+results[i].unit,
                      position: {lat: curLat, lng: curLng}

                    }));
                  }

                }
              );
              $http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" +lat +","+lng+ "&key=AIzaSyAZnh-iHB9U_H2RYHtK_l0sNH9tHzWLaNs").then(function(response) {
                document.getElementById("addr").textContent = response.data.results[0].formatted_address;
                document.getElementById("ll").textContent = lnglat;
              });

          });
          // Bias the SearchBox results towards current map's viewport.
          map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());



          });

          var markers = [];
          // Listen for the event fired when the user selects a prediction and retrieve
          // more details for that place.
          searchBox.addListener('places_changed', function() {

            var places = searchBox.getPlaces();

            if (places.length == 0) {
              return;
            }

            // Clear out the old markers.
            markers.forEach(function(marker) {
              marker.setMap(null);
            });
            markers = [];

            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            places.forEach(function(place) {
              if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
              }
              var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
              };

              // Create a marker for each place.
              markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location

              }));

              if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
              } else {
                bounds.extend(place.geometry.location);
              }
            });
            map.fitBounds(bounds);
            lnglat = map.getCenter();
            radius = getBoundsRadius(map.getBounds());
              $http.get("https://api.openaq.org/v1/measurements?coordinates="+lat+","+lng+"&radius="+radius).then(
                function(response)
                {
                  $scope.tableData = response.data.results;
                }
              );

          });
          $http.get("https://api.openaq.org/v1/measurements?coordinates="+lat+","+lng+"&radius="+radius).then(
            function(response)
            {
              var results = response.data.results;
              $scope.tableData = response.data.results;
              var i = 0;
              for(i=0;i<results.length;i++){
                curLat = results[i].coordinates.latitude;
                curLng = results[i].coordinates.longitude;
                markers.push(new google.maps.Marker({
                  map: map,
                  title: "Location: " + results[i].location +
                  "\nDate: "+results[i].date.local+
                  "\nParticle: "+results[i].parameter+
                  "\nMeasurement: "+results[i].value+results[i].unit,
                  position: {lat: curLat, lng: curLng}

                }));
              }
              var markerCluster = new MarkerClusterer(map, markers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
            }
          );

          $http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" +lat +","+lng+ "&key=AIzaSyAZnh-iHB9U_H2RYHtK_l0sNH9tHzWLaNs").then(function(response) {
            document.getElementById("addr").textContent = response.data.results[0].formatted_address;
            document.getElementById("ll").textContent = lnglat;
          });

    }
  }, 500);




});

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 44.976877256928, lng: -93.17484381979153},
          zoom: 13,
          mapTypeId: 'roadmap'
        });

}
function updateLnglat(val){
  lnglat=val;
  document.getElementById('ll').value = lnglat;
  //document.getElementById('ll').innerHTML = lnglat;
  document.getElementById('ll').textContent = lnglat;

}

function getBoundsRadius(bounds){
  //https://stackoverflow.com/questions/3525670/radius-of-viewable-region-in-google-maps-v3
  // r = radius of the earth in km
  var r = 6378.8
  // degrees to radians (divide by 57.2958)
  var ne_lat = bounds.getNorthEast().lat() / 57.2958
  var ne_lng = bounds.getNorthEast().lng() / 57.2958
  var c_lat = bounds.getCenter().lat() / 57.2958
  var c_lng = bounds.getCenter().lng() / 57.2958
  // distance = circle radius from center to Northeast corner of bounds
  var r_km = r * Math.acos(
    Math.sin(c_lat) * Math.sin(ne_lat) +
    Math.cos(c_lat) * Math.cos(ne_lat) * Math.cos(ne_lng - c_lng)
    )
  return r_km *1000 // radius in meters
}
