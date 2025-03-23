const prisma = require("../config/prisma");

const User = {
    findByEmail: async (email) => {
        return prisma.user.findUnique({ where: { email } });
    },

    create: async (userData) => {
        return prisma.user.create({ data: userData });
    }
};

module.exports = User;