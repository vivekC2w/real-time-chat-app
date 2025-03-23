const express = require("express");
const { sendMessage, messageAck } = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send", authMiddleware, sendMessage);
router.post("/ack", authMiddleware, messageAck);

module.exports = router;
