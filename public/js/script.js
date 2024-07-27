const socket = io();

let popup = L.popup();

function onMapClick(e) {
   popup.setLatLng(e.latlng).setContent("You clicked the map at " + e.latlng.toString()).openOn(map);
}

const map = L.map("map").setView([0,0], 16);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
   attribution: "Sainath-Maps"
}).addTo(map);

const markers = {};

const redIcon = L.icon({
   iconUrl: '/images/red-icon.png',
   iconSize: [30, 41],
   iconAnchor: [12, 41],
   popupAnchor: [1, -34],
   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
   shadowSize: [41, 41]
});

const blueIcon = L.icon({
   iconUrl: '/images/blue-icon.png',
   iconSize: [30, 41],
   iconAnchor: [12, 41],
   popupAnchor: [1, -34],
   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
   shadowSize: [41, 41]
});

function addOrUpdateMarker(data){
   const {id,latitude,longitude,username:markerUsername} = data;
   const icon = (markerUsername === username) ? redIcon : blueIcon;
   if(markers[id]){
      markers[id].setLatLng([latitude,longitude]);
      markers[id].setIcon(icon);
   }else{
      markers[id] = L.marker([latitude,longitude],{icon}).addTo(map).bindPopup(markerUsername).openPopup();
   }
}

socket.emit("join",username);

socket.on("existing-users", (users) => {
   users.forEach(addOrUpdateMarker);
});

if(navigator.geolocation){
   navigator.geolocation.watchPosition((position)=>{
      const {latitude, longitude} = position.coords;
      socket.emit("send-position",{latitude,longitude,username});
   }, (error) => {
      console.error(error);
   }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
   })
}

socket.on("receive-position", (userData) => {
   addOrUpdateMarker(userData);
   if (userData.username === username) {
      map.setView([userData.latitude, userData.longitude], 16);
   }
});

map.on('click', onMapClick);

socket.on("user-disconnect",(data)=>{
   const {id} = data;
   if(markers[id]){
      map.removeLayer(markers[id]);
      delete markers[id];
   }
})
 


