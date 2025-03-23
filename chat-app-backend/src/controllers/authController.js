const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;

//SignUp
exports.signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email }});
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPass = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { email, name, password: hashedPass },
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