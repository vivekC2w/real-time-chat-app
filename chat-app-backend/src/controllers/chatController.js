const redisClient = require("../config/redis");
const { saveFile } = require("../helper/utility");
const Message = require("../models/messageModel");

exports.sendMessage = async (req, res) => {

    const { senderId, receiverId, content, type, timestamp } = req.body;

    if (!senderId || !receiverId || !content || !type) {
        console.error("Missing required fields in msgData");
        return;
    }
    try {
        //msg have a unique identifier and timestamp
        const messageId = uuidv4();
        const msg = await Message.create({ _id: messageId, senderId, receiverId, content, type, timestamp });

        const recipientSocketId = global.activeUsers[receiverId];
        if (recipientSocketId) {
            const orderedMessages = await Message.find({ receiverId }).sort({ timestamp: 1 });
            io.to(recipientSocketId).emit("receiveMessage", orderedMessages);
        } else {
            await redisClient.zAdd(`offlineMessages:${receiverId}`, JSON.stringify(msg));
        }
        res.json({ message: "Message sent successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.userOnline = async (socket, userId) => {
    global.activeUsers[userId] = socket.id;

    const msgs = await redisClient.zRange(`offlineMessages:${userId}`, 0, -1);

    if (msgs.length > 0) {
        msgs.forEach((msg) => {
            socket.emit("receiveMessage", JSON.parse(msg));
        });
        await redisClient.del(`offlineMessages:${userId}`);
    }
};

exports.messageAck = async (msgId) => {
    await Message.updateStatus(msgId, "delivered");
};

// Handling resumable media uploads
exports.uploadMedia = async (req, res) => {
    const { senderId, receiverId, fileChunk, chunkIndex, totalChunks, fileId } = req.body;

    if (!senderId || !receiverId || !fileChunk || chunkIndex === undefined || totalChunks === undefined || !fileId) {
        return res.status(400).json({ error: "Missing required fields for file upload" });
    }

    try {
        // Store chunk in Redis for resumable uploads
        await redisClient.hSet(`fileUpload:${fileId}`, chunkIndex, fileChunk);

        // Check if all chunks are uploaded
        const uploadedChunks = await redisClient.hLen(`fileUpload:${fileId}`);
        if (uploadedChunks === totalChunks) {
            const fileData = await redisClient.hGetAll(`fileUpload:${fileId}`);
            const sortedChunks = Object.keys(fileData).sort().map(key => fileData[key]);

            // Save complete file and clean up Redis
            const filePath = `/uploads/${fileId}`;
            await saveFile(sortedChunks.join(""), filePath);
            await redisClient.del(`fileUpload:${fileId}`);

            // Notify recipient
            const recipientSocketId = global.activeUsers[receiverId];
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("receiveMedia", { senderId, filePath });
            }
            res.json({ message: "File uploaded successfully", filePath });
        } else {
            res.json({ message: `Chunk ${chunkIndex}/${totalChunks} received` });
        }
    } catch (error) {
        res.status(500).json({ error: "Error handling file upload" });
    }
};

// State recovery on reconnect
exports.getChatHistory = async (req, res) => {
    const { userId, recipientId } = req.params;

    if (!userId || !recipientId) {
        return res.status(400).json({ error: "Missing userId or recipientId" });
    }

    try {
        // Retrieve last 50 messages
        const messages = await Message.find({
            $or: [{ senderId: userId, receiverId: recipientId }, { senderId: recipientId, receiverId: userId }]
        }).sort({ timestamp: -1 }).limit(50);

        res.json({ messages });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};