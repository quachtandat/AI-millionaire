const express = require("express");

const router = express.Router();

const { startGame, getCurrentGame, answerQuestion, stopCurrentGame, getGameHistory, getGameDetail } = require("../controllers/game.controller");

const { authenticateToken } = require("../middleware/auth.middleware");

// Bắt đầu game
router.post("/start",authenticateToken, startGame);
// lấy history game
router.get("/history", authenticateToken, getGameHistory);
// Lấy game detail
router.get("/:id/detail", authenticateToken, getGameDetail);
// Lấy game hiện tại
router.get("/:id", authenticateToken, getCurrentGame);
// Trả lời câu hỏi hiện tại
router.post("/:id/answer",authenticateToken,answerQuestion);
// stop game
router.post("/:id/stop", authenticateToken, stopCurrentGame);


module.exports = router;