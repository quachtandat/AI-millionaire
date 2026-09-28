const express = require("express");

const router = express.Router();

const { startGame, getCurrentGame, answerQuestion } = require("../controllers/game.controller");

const { authenticateToken } = require("../middleware/auth.middleware");

// Bắt đầu game
router.post("/start",authenticateToken,startGame);
// Lấy game hiện tại
router.get("/:id", authenticateToken, getCurrentGame);
// Trả lời câu hỏi hiện tại
router.post("/:id/answer",authenticateToken,answerQuestion);

module.exports = router;