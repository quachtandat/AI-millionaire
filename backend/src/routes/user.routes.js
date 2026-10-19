const express = require("express");

const router = express.Router();

const { getUserProfile, updateUserProfile, changePassword, uploadAvatar, getKnowledgeProfile, getRecommendations, getAdminOverview } = require("../controllers/user.controller");

const { authenticateToken } = require("../middleware/auth.middleware");

const  upload  = require("../middleware/upload.middleware");
const { requireAdmin } = require("../middleware/admin.middleware");

router.get("/me/knowledge-profile", authenticateToken, getKnowledgeProfile);
router.get("/me/recommendations", authenticateToken, getRecommendations);
router.get("/admin/overview", authenticateToken, requireAdmin, getAdminOverview);

router.get("/profile", authenticateToken, getUserProfile );

router.put("/profile", authenticateToken, updateUserProfile );

router.put("/change-password", authenticateToken, changePassword );

router.post( "/avatar", authenticateToken, upload.single("avatar"), uploadAvatar );

module.exports = router;
