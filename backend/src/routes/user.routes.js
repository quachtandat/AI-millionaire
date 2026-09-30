const express = require("express");

const router = express.Router();

const { getUserProfile, updateUserProfile, changePassword, uploadAvatar } = require("../controllers/user.controller");

const { authenticateToken } = require("../middleware/auth.middleware");

const  upload  = require("../middleware/upload.middleware");

router.get("/profile", authenticateToken, getUserProfile );

router.put("/profile", authenticateToken, updateUserProfile );

router.put("/change-password", authenticateToken, changePassword );

router.post( "/avatar", authenticateToken, upload.single("avatar"), uploadAvatar );

module.exports = router;