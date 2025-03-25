const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { message } = require("../config/prisma");
const multer = require("multer");
const path = require("path");

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "")
    }
})

//SignUp
exports.signup = async (req, res) => {
    try {
        let { email, password, name, profilePicture } = req.body;

        email = email.trim();
        name = name.trim();

        if (!email || !password || !name) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email }});
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPass = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { email, name, password: hashedPass, profilePicture: profilePicture || null },
        });

        res.status(201).json({ message: "User created successfully", userId: user.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        //find user
        const user = await prisma.user.findUnique({ where: { email }});
        if (!user) return res.status(400).json({ message: "Invalid credentials "});

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials"});

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ token, userId: user.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.users = async (req, res) => {
    try {
        const users = await prisma.user.findMany({}, "name email");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.messages = async (req, res) => {
    try {
        const { senderId, receiverId } = req.query;

        if (!senderId || !receiverId) {
            return res.status(400).json({ error: "SenderId and ReceiverId are required" });
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ]
            },
            orderBy: { timestamp: "asc" }, 
        });
        res.json({ data: messages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}