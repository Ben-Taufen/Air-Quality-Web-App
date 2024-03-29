
var airQualityApp = angular.module('airQualityApp',[]);
var lnglat;
var lat = 44.976877256928;
var lng = -93.17484381979153;
var radius = 8300;
var markers = [];
var heatMap = false;
var coordinates = "";
var pRadius = "";
var parameter = "";


//var particle = "";

airQualityApp.controller('tableController',function($scope, $http){
	//

	$scope.particleTypeList = [ "", "pm25", "pm10", "so2", "no2", "o3", "co", "bc"];
	$scope.particle = "";
	$scope.historicalOrLatest = ["latest", "historical"];
	$scope.mode = $scope.historicalOrLatest[0];
	$scope.min = "0";
	$scope.max = "1000000";
  $scope.$watch('particle', function(){
    var hm = document.getElementById('floating-panel');
    if($scope.particle!==''){
      hm.style.visibility='visible';
    }else{
      hm.style.visibility='hidden';
      markers.forEach(function(marker) {
        marker.setMap(null);
      });
      markers = [];
    }

  });
  
  //new
  $scope.$watch('mode', function(){
	  
	  		
	  
	  
	  
    if($scope.mode === $scope.historicalOrLatest[0] ){
	//	alert("latest mode"); //DEBUG
		
		 var google_wait = setInterval(() => {
		if (map !== undefined) {
			
		  clearInterval(google_wait);
			  // Create the search box and link it to the UI element.
			  var input = document.getElementById('pac-input');
			  var hm = document.getElementById('floating-panel');
			  var searchBox = new google.maps.places.SearchBox(input);
			  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
			  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(hm);

			  
			 map.addListener('dragend', function(){
		
		//have latest's listener only do work when mode is latest
	//	if($scope.mode === $scope.historicalOrLatest[0])
	//	{
		
		
		
				//updateLnglat(map.getCenter());
				lnglat = map.getCenter();
				radius = getBoundsRadius(map.getBounds());
				if(lnglat!=null){
				  lat=lnglat.lat();
				  lng=lnglat.lng();
				}
				if($scope.particle!==''){
				  parameter="&parameter="+$scope.particle;
				}
				markers.forEach(function(marker) {
				  marker.setMap(null);
				});
				  markers = [];
				  $http.get("https://api.openaq.org/v1/latest?coordinates="+lat+","+lng+"&radius="+radius+parameter).then(
					function(response)
					{

					  var heatMapData=[];
					  var results = response.data.results;
					  $scope.tableData = response.data.results;
					  var i = 0;

					  markers.forEach(function(marker) {
						marker.setMap(null);
					  });
					  markers = [];
					  for(i=0;i<results.length;i++){
						curLat = results[i].coordinates.latitude;
						curLng = results[i].coordinates.longitude;
						var measurements = "";
						for(var j=0;j<results[i].measurements.length;j++){
						  measurements = measurements + "\nParticle: "+results[i].measurements[j].parameter+
						  " "+results[i].measurements[j].value+results[i].measurements[j].unit
						}
						markers.push(new google.maps.Marker({
						  map: map,
						  title: "Location: " + results[i].location +
						  //"\nDate: "+results[i].date.local+
						  measurements,
						  position: {lat: curLat, lng: curLng}

						}));
						if(heatMap){
						  heatMapData.push({location: new google.maps.LatLng(curLat, curLng), weight: results[i].measurements[0].value});
						}
						else{
						  heatMapData = [];
						}
					  }
					  var heatmap = new google.maps.visualization.HeatmapLayer({
						data: heatMapData
					  });

					  /*$scope.toggleHeatmap = function(){
						heatmap.setMap(heatmap.getMap() ? null : map);
					  };*/
					  if(heatMap){
						heatmap.setMap(map);
						heatmap.set('radius',100);
						heatmap.set('gradient',['rgba(0, 255, 255, 0)',
			  'rgba(0, 255, 255, 1)',
			  'rgba(0, 191, 255, 1)',
			  'rgba(0, 127, 255, 1)',
			  'rgba(0, 63, 255, 1)',
			  'rgba(0, 0, 255, 1)',
			  'rgba(0, 0, 223, 1)',
			  'rgba(0, 0, 191, 1)',
			  'rgba(0, 0, 159, 1)',
			  'rgba(0, 0, 127, 1)',
			  'rgba(63, 0, 91, 1)',
			  'rgba(127, 0, 63, 1)',
			  'rgba(191, 0, 31, 1)',
			  'rgba(255, 0, 0, 1)']);
						markers.forEach(function(marker) {
						  marker.setMap(null);
						});
						markers=[];
					}else{

					  heatmap.setMap(null);
					  heatMapData=[];
					}
					  var markerCluster = new MarkerClusterer(map, markers,
					{imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
					}
				  );
				  $http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" +lat +","+lng+ "&key=AIzaSyAZnh-iHB9U_H2RYHtK_l0sNH9tHzWLaNs").then(function(response) {
					document.getElementById("addr").textContent = response.data.results[0].formatted_address;
					document.getElementById("ll").textContent = lnglat;
				  });
				  parameter=""; 
//	}//end
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
				  $http.get("https://api.openaq.org/v1/latest?coordinates="+lat+","+lng+"&radius="+radius+parameter).then(
					function(response)
					{
					  $scope.tableData = response.data.results;
					}
				  );

			  });
			  coordinates = "coordinates="+lat+","+lng;
			  pRadius = "&radius="+radius;
			  if($scope.particle!==""){
				parameter="&parameter="+$scope.particle;
			  }
			  $http.get("https://api.openaq.org/v1/latest?coordinates="+lat+","+lng+"&radius="+radius+parameter).then(
				function(response)
				{
				  var results = response.data.results;
				  $scope.tableData = response.data.results;
				  var i = 0;
				  markers.forEach(function(marker) {
					marker.setMap(null);
				  });
				  markers = [];

				  for(i=0;i<results.length;i++){
					curLat = results[i].coordinates.latitude;
					curLng = results[i].coordinates.longitude;
					var measurements = "";
					for(var j=0;j<results[i].measurements.length;j++){
					  measurements = measurements + "\nParticle: "+results[i].measurements[j].parameter+
					  " "+results[i].measurements[j].value+results[i].measurements[j].unit
					}
					markers.push(new google.maps.Marker({
					  map: map,
					  title: "Location: " + results[i].location +
					  //"\nDate: "+results[i].date.local+
					  measurements,
					  position: {lat: curLat, lng: curLng}

					}));
				  }
				  var markerCluster = new MarkerClusterer(map, markers,
				{imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
				}
			  );

			  $http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" +lat +","+lng+ "&key=AIzaSyAZnh-iHB9U_H2RYHtK_l0sNH9tHzWLaNs").then(function(response) {
				document.getElementById("addr").textContent = response.data.results[0].formatted_address;
				document.getElementById("ll").textContent = map.getCenter();
			  });
		}
	  }, 500);

    }else{
	//	alert("historical mode"); //DEBUG
		
////////////////////////////////////////////////////		
		

		 var google_wait = setInterval(() => {
    if (map !== undefined) {
      clearInterval(google_wait);
          // Create the search box and link it to the UI element.
          var input = document.getElementById('pac-input');
          var hm = document.getElementById('floating-panel');
          var searchBox = new google.maps.places.SearchBox(input);
          map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
          map.controls[google.maps.ControlPosition.TOP_RIGHT].push(hm);


         map.addListener('dragend', function(){
            //updateLnglat(map.getCenter());
	//have historical's listener only do work when mode is historical
//	if($scope.mode !== $scope.historicalOrLatest[0])
//	{
            lnglat = map.getCenter();
            radius = getBoundsRadius(map.getBounds());
            if(lnglat!=null){
              lat=lnglat.lat();
              lng=lnglat.lng();
            }
            if($scope.particle!==''){
              parameter="&parameter="+$scope.particle;
            }
            markers.forEach(function(marker) {
              marker.setMap(null);
            });
              markers = [];
              $http.get("https://api.openaq.org/v1/measurements?coordinates="+lat+","+lng+"&radius="+radius+parameter).then(
                function(response)
                {

                  var heatMapData=[];
                  var results = response.data.results;
                  $scope.tableData = response.data.results;
                  var i = 0;

                  markers.forEach(function(marker) {
                    marker.setMap(null);
                  });
                  markers = [];
                  for(i=0;i<results.length;i++){
                    curLat = results[i].coordinates.latitude;
                    curLng = results[i].coordinates.longitude;
                 /*   var measurements = "";
                    for(var j=0;j<results[i].measurements.length;j++){
                      measurements = measurements + "\nParticle: "+results[i].measurements[j].parameter+
                      " "+results[i].measurements[j].value+results[i].measurements[j].unit
                    }*/
                    markers.push(new google.maps.Marker({
                      map: map,
                      title: "Location: " + results[i].location +
                      //"\nDate: "+results[i].date.local+
                      results[i].parameter + " " + results[i].value + results[i].unit,
                      position: {lat: curLat, lng: curLng}

                    }));
                    if(heatMap){
                      heatMapData.push({location: new google.maps.LatLng(curLat, curLng), weight: results[i].measurements[0].value});
                    }
                    else{
                      heatMapData = [];
                    }
                  }
                  var heatmap = new google.maps.visualization.HeatmapLayer({
                    data: heatMapData
                  });

                  /*$scope.toggleHeatmap = function(){
                    heatmap.setMap(heatmap.getMap() ? null : map);
                  };*/
                  if(heatMap){
                    heatmap.setMap(map);
                    heatmap.set('radius',100);
                    heatmap.set('gradient',['rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)']);
                    markers.forEach(function(marker) {
                      marker.setMap(null);
                    });
                    markers=[];
                }else{

                  heatmap.setMap(null);
                  heatMapData=[];
                }
                  var markerCluster = new MarkerClusterer(map, markers,
                {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
                }
              );
              $http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" +lat +","+lng+ "&key=AIzaSyAZnh-iHB9U_H2RYHtK_l0sNH9tHzWLaNs").then(function(response) {
                document.getElementById("addr").textContent = response.data.results[0].formatted_address;
                document.getElementById("ll").textContent = lnglat;
              });
              parameter="";
//}//end
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
              $http.get("https://api.openaq.org/v1/measurements?coordinates="+lat+","+lng+"&radius="+radius+parameter).then(
                function(response)
                {
                  $scope.tableData = response.data.results;
                }
              );

          });
          coordinates = "coordinates="+lat+","+lng;
          pRadius = "&radius="+radius;
          if($scope.particle!==""){
            parameter="&parameter="+$scope.particle;
          }
          $http.get("https://api.openaq.org/v1/measurements?coordinates="+lat+","+lng+"&radius="+radius+parameter).then(
            function(response)
            {
              var results = response.data.results;
              $scope.tableData = response.data.results;
              var i = 0;
              markers.forEach(function(marker) {
                marker.setMap(null);
              });
              markers = [];

              for(i=0;i<results.length;i++){
                curLat = results[i].coordinates.latitude;
                curLng = results[i].coordinates.longitude;
               /* var measurements = "";
                for(var j=0;j<results[i].measurements.length;j++){
                  measurements = measurements + "\nParticle: "+results[i].measurements[j].parameter+
                  " "+results[i].measurements[j].value+results[i].measurements[j].unit
                }*/
                markers.push(new google.maps.Marker({
                  map: map,
                  title: "Location: " + results[i].location +
                  //"\nDate: "+results[i].date.local+
                  results[i].parameter + " " + results[i].value + results[i].unit,
                  position: {lat: curLat, lng: curLng}

                }));
              }
              var markerCluster = new MarkerClusterer(map, markers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
            }
          );

          $http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" +lat +","+lng+ "&key=AIzaSyAZnh-iHB9U_H2RYHtK_l0sNH9tHzWLaNs").then(function(response) {
            document.getElementById("addr").textContent = response.data.results[0].formatted_address;
            document.getElementById("ll").textContent = map.getCenter();
          });

    }
	
  }, 500);


		
		
		
/////////////////////////////////////////////////////////	
		
    }

  });
  
  
  
 


});

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 44.976877256928, lng: -93.17484381979153},
          zoom: 13,
          mapTypeId: 'roadmap'
        });
        var legend = document.getElementById('legend');

                 var div = document.createElement('p');
                 div.innerHTML = 'More intense heatmap = larger particle value';
                 legend.appendChild(div);



               map.controls[google.maps.ControlPosition.BOTTOM].push(legend);
 }



function toggleHeatmap(){
  heatMap=!heatMap;
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
