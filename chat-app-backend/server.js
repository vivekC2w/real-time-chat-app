require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
// const redisClient = require("./config/redis");
const authRoutes = require("./src/routes/authRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { 
    cors: { 
        origin: "*",
        methods: ["GET", "POST"] 
    } 
});

global.activeUsers = {};

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // socket.on("sendMessage", async (msgData) => {
    //     console.log("Received sendMessage event:", msgData);
    //     await sendMessage(io, msgData);
    // });

    // socket.on("userOnline", async (userId) => {
    //     console.log(`User ${userId} is online`);
    //     await userOnline(socket, userId);
    // });

    socket.on("disconnect", () => console.log(`User disconnected: ${socket.id}`));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
