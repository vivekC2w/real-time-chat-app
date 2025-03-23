const prisma = require("../config/prisma");

const Message = {
    create: async (msgData) => {
        return prisma.message.create({ 
            data: {
                senderId: msgData.senderId,
                receiverId: msgData.receiverId,
                content: msgData.content,
                type: msgData.type,
            } 
        });
    },

    updateStatus: async (msgId, status) => {
        return prisma.message.update({ where: { id: msgId }, data: { status } });
    }
};

module.exports = Message;
