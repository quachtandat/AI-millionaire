const express = require("express");

const questionController =
    require("../controllers/question.controller");

const {
    authenticateToken
} = require("../middleware/auth.middleware");

const {
    requireAdmin
} = require("../middleware/admin.middleware");

const router = express.Router();

// Admin only
router.post(
    "/",
    authenticateToken,
    requireAdmin,
    questionController.createQuestion
);

router.put(
    "/:id",
    authenticateToken,
    requireAdmin,
    questionController.updateQuestion
);

router.delete(
    "/:id",
    authenticateToken,
    requireAdmin,
    questionController.deleteQuestion
);

// Có thể dùng cho admin sau này
router.get(
    "/",
    authenticateToken,
    requireAdmin,
    questionController.getQuestions
);

router.get(
    "/:id",
    authenticateToken,
    requireAdmin,
    questionController.getQuestion
);

module.exports = router;