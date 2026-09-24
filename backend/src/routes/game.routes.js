const express = require("express");

const router = express.Router();

const { startGame } = require("../controllers/game.controller");

const { authenticateToken } = require("../middleware/auth.middleware");



router.post("/start",authenticateToken,startGame);


module.exports = router;