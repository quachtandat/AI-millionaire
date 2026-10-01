const express = require("express");

const router = express.Router();

const { authenticateToken } = require("../middleware/auth.middleware");

const { requireAdmin } = require("../middleware/admin.middleware");

const { generateQuestions } = require("../controllers/ai-question.controller");

router.post("/generate", authenticateToken, requireAdmin, generateQuestions );

module.exports = router;