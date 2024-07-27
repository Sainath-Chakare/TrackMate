const socket = io();

let popup = L.popup();

function onMapClick(e) {
   popup.setLatLng(e.latlng).setContent("You clicked the map at " + e.latlng.toString()).openOn(map);
}

if(navigator.geolocation){
   navigator.geolocation.watchPosition((position)=>{
      const {latitude, longitude} = position.coords;
      socket.emit("send-position",{latitude,longitude});
   }, (error) => {
      console.error(error);
   }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
   })
}


const map = L.map("map").setView([0,0], 16);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
   attribution: "Sainath-Maps"
}).addTo(map);

const markers = {};
socket.on("receive-position",(data)=>{
   const {id,latitude,longitude} = data;
   map.setView([latitude,longitude]);
   if(markers[id]){
      markers[id].setLatLang([latitude,longitude]);
   }else{
      markers[id] = L.marker([latitude,longitude]).addTo(map).bindPopup(`${username}`).openPopup();
   }
   map.on('click', onMapClick);
})

socket.on("user-disconnect",(id)=>{
   if(markers[id]){
      map.removeLayer(markers[id]);
      delete markers[id];
   }
})
 


