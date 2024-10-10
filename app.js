const express = require('express');
const app = express();
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Store users' data (id, location, and username)
const users = {};

io.on("connection", (socket) => {
    console.log("New client connected");

    // Listen for 'send-location' event from clients
    socket.on("send-location", ({ latitude, longitude, username }) => {
        // Store the user’s location and name by their socket ID
        users[socket.id] = { latitude, longitude, username };

        // Broadcast the location and username to all other clients
        io.emit("receive-location", {
            id: socket.id,
            latitude: latitude,
            longitude: longitude,
            username: username
        });
    });

    // When a client disconnects
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        // Remove the user data from the users list
        delete users[socket.id];
    });
});

app.get("/", (req, res) => {
    res.render("index");
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});
