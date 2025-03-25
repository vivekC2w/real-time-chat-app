const express = require("express");
const { signup, login, users, messages } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/users", users);
router.get("/messages", messages);

module.exports = router;