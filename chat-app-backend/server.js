require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
    },
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on("disconnected", () => {
        console.log(`A user disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});