const express = require("express");

const router = express.Router();

const { authenticateToken } = require("../middleware/auth.middleware");

const { requireAdmin } = require("../middleware/admin.middleware");

const { generateQuestions, getAIDraftQuestions, approveAIQuestion, rejectAIQuestion } = require("../controllers/ai-question.controller");

router.post("/generate", authenticateToken, requireAdmin, generateQuestions );

router.get("/draft", authenticateToken, requireAdmin, getAIDraftQuestions );

router.post("/:id/approve", authenticateToken, requireAdmin, approveAIQuestion );

router.post("/:id/reject", authenticateToken, requireAdmin, rejectAIQuestion );

module.exports = router;