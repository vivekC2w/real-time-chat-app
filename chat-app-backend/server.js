require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { createClient } = require("redis");

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
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

io.on("connection", (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on("sendMessage", async (msgData) => {
        const {senderId, receiverId, content, type} = msgData;

        //storing msg in database
        const msg = await Prisma.message.create({
            data: { senderId, receiverId, content, type }
        });

        //store undelivered msg in Redis if the recipient is offline
        const recipientSocketId = activeUsers[receiverId];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("receiveMessage", msg);
        } else {
            await redisClient.lPush(`offline:${receiverId}`, JSON.stringify(msg));
        }
    })

    socket.on("userOnline", async (userId) => {
        activeUsers[userId] = socket.id;

        //send offline msgs if any exists
        const msgs = await redisClient.lRange(`offline:${userId}`, 0, -1);
        if (msgs.length > 0) {
            msgs.forEach((msg) => {
                io.to(socket.id).emit("receiveMessage", JSON.parse(msg));
            });
            await redisClient.del(`offline:${userId}`);
        }
    });

    socket.on("disconnected", () => {
        console.log(`A user disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});