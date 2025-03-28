require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const redis = require("./src/config/redis");
const authRoutes = require("./src/routes/authRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, 
    ssl: {
        rejectUnauthorized: false, 
    },
});

pool.connect()
    .then(() => console.log("Connected to PostgreSQL Database ✅"))
    .catch(err => console.error("Database Connection Error ❌", err));

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const io = socketIo(server, { 
    cors: { 
        origin: FRONTEND_URL,
        methods: ["GET", "POST"] 
    } 
});

global.activeUsers = {};

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    socket.on("online", async (userId) => {
        console.log(`User ${userId} is online. Checking for offline messages...`);
        if (!userId) return;
        global.activeUsers[userId] = socket.id;
        try {
            const offlineMessages = await redis.zRange(`offlineMessages:${userId}`, 0, -1);
            if (offlineMessages.length > 0) {
                offlineMessages.forEach((msg) => {
                    socket.emit("receiveMessage", JSON.parse(msg));
                });
                await redis.del(`offlineMessages:${userId}`);
            }
        } catch (error) {
            console.error("Error resending messages:", error);
        }
    })

    socket.on("resendOfflineMessages", async (userId) => {
        try {
            const offlineMessages = await redis.zRange(`offlineMessages:${userId}`, 0, -1);
            offlineMessages.forEach((msg) => {
                socket.emit("receiveMessage", JSON.parse(msg));
            });
            await redis.del(`offlineMessages:${userId}`);
        } catch (error) {
            console.error("Error resending messages:", error);
        }
    });

    socket.on("sendMessage", async (msg) => {
        console.log("Message sending",msg);
        if (!msg.receiverId) return;
        const recipientSocketId = global.activeUsers[msg.receiverId];
        try {
            const messageId = uuidv4();
            await pool.query(
                'INSERT INTO "Message" ("id", "senderId", "receiverId", "content", "type", "timestamp") VALUES ($1, $2, $3, $4, $5, $6)',
                [messageId, msg.senderId, msg.receiverId, msg.content, msg.type, new Date(msg.timestamp)]
            );            
            console.log("Message saved in the database:", msg);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("receiveMessage", msg);
            } else {
                // Store in Redis only if the recipient is offline
                await redis.zAdd(`offlineMessages:${msg.receiverId}`, [{
                    score: Date.now(),
                    value: JSON.stringify(msg),
                }]);
            }
        } catch (error) {
            console.error("Error handling message:", error);
        }
    });

    socket.on("disconnect", () => console.log(`User disconnected: ${socket.id}`));
    
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
