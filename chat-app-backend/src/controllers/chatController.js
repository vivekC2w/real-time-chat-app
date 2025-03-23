const redisClient = require("../config/redis");
const Message = require("../models/messageModel");

exports.sendMessage = async (req, res) => {
    // console.log("Received msgData:", msgData);

    const { senderId, receiverId, content, type } = req.body;
    console.log("senderId:", senderId);
    console.log("receiverId:", receiverId);
    console.log("content:", content);
    console.log("type:", type);

    if (!senderId || !receiverId || !content || !type) {
        console.error("Missing required fields in msgData");
        return;
    }
    try {
        const msg = await Message.create({ senderId, receiverId, content, type });

        const recipientSocketId = global.activeUsers[receiverId];
        if (recipientSocketId) {
            const orderedMessages = await Message.find({ receiverId }).sort({ timestamp: 1 });
            io.to(recipientSocketId).emit("receiveMessage", orderedMessages);
        } else {
            await redisClient.lPush(`offline:${receiverId}`, JSON.stringify(msg));
        }
        res.json({ message: "Message sent successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.userOnline = async (socket, userId) => {
    global.activeUsers[userId] = socket.id;

    const msgs = await redisClient.lRange(`offline:${userId}`, 0, -1);
    if (msgs.length > 0) {
        msgs.forEach((msg) => {
            socket.emit("receiveMessage", JSON.parse(msg));
        });
        await redisClient.del(`offline:${userId}`);
    }
};

exports.messageAck = async (msgId) => {
    await Message.updateStatus(msgId, "delivered");
};