const express = require("express");

const router = express.Router();

const { startGame, getCurrentGame, answerQuestion, timeoutCurrentGame, stopCurrentGame, getGameHistory, getGameDetail, getGameRanking, getGameStatistics, useFiftyFifty, useAudience, usePhone } = require("../controllers/game.controller");

const { authenticateToken } = require("../middleware/auth.middleware");

// Bắt đầu game
router.post("/start",authenticateToken, startGame);
// lấy history game
router.get("/history", authenticateToken, getGameHistory);
// rank
router.get("/ranking", authenticateToken, getGameRanking);
// Personal Statistics
router.get("/statistics", authenticateToken, getGameStatistics);
// Lấy game detail
router.get("/:id/detail", authenticateToken, getGameDetail);
// Lấy game hiện tại
router.get("/:id", authenticateToken, getCurrentGame);
// Trả lời câu hỏi hiện tại
router.post("/:id/answer",authenticateToken,answerQuestion);
// Mark the current question as unanswered after the player's timer expires.
router.post("/:id/timeout", authenticateToken, timeoutCurrentGame);
// stop game
router.post("/:id/stop", authenticateToken, stopCurrentGame);
// 50:50
router.post("/:id/lifelines/fifty-fifty", authenticateToken, useFiftyFifty);
// Audience
router.post("/:id/lifelines/audience", authenticateToken, useAudience);
// phone
router.post("/:id/lifelines/phone", authenticateToken, usePhone);

module.exports = router;