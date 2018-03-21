var longitude;
var latitude;

if (navigator.geolocation) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
} else {
    latitude = -25.363;
    longitude = 131.044;
}

function initMap() {
  var uluru = {lat: -25.363, lng: 131.044};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: uluru
  });
  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  });
}
