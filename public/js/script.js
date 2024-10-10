const socket = io();

// Ask for the user's name when they connect
let username = prompt("Enter your name:");

// Send location data if geolocation is available
if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        // Send the user's name along with location data
        socket.emit("send-location", { latitude, longitude, username });
    }, (error) => {
        console.error("Error getting location:", error);
    }, {
        enableHighAccuracy: true,
        timeout: 10000,  // Increase timeout to 10 seconds
        maximumAge: 0
    });
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap"
}).addTo(map);

// Store markers by user ID to avoid duplications
const markers = {};

// Listen for location updates from the server
socket.on("receive-location", (data) => {
    const { id, latitude, longitude, username } = data;
    
    // Check if the marker for this user already exists
    if (!markers[id]) {
        // Create a new marker for this user
        markers[id] = L.marker([latitude, longitude]).addTo(map);

        // Add a popup to the marker with the user's name
        markers[id].bindPopup(`<b>${username}</b>`).openPopup();
    } else {
        // Update the marker position if it already exists
        markers[id].setLatLng([latitude, longitude]);
        // Update the popup content
        markers[id].getPopup().setContent(`<b>${username}</b>`).openOn(map);
    }

    // Optionally set the map view to the latest position
    map.setView([latitude, longitude], 13);  // Adjust zoom level as needed
});
