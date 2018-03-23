var lnglat;
var airQualityApp = angular.module('airQualityApp',[]);
//will show the current address and longitude/lat of the current center of the map
//having trouble with the controller, probably a small error that I need to change
//otherwise this code works
//to get the current center, just use the lnglat variable. It stores a lnglat object.
//to get the lat use the function lnglat.lat()
airQualityApp.controller('addrController', function($scope, $http) {
  $http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" +lnglat + "&key=AIzaSyAZnh-iHB9U_H2RYHtK_l0sNH9tHzWLaNs").then(function(response) {
    $scope.address = response.data.results[0].formatted_address;
    $scope.lnglat = lnglat;

  });
});
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -33.8688, lng: 151.2195},
          zoom: 13,
          mapTypeId: 'roadmap'
        });

        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());

          lnglat=map.getCenter();
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
        });

}
