const express = require("express");

const categoryController =
    require("../controllers/category.controller");

const {
    authenticateToken
} = require("../middleware/auth.middleware");

const {
    requireAdmin
} = require("../middleware/admin.middleware");

const router = express.Router();

router.get(
    "/",
    categoryController.getCategories
);

router.post(
    "/",
    authenticateToken,
    requireAdmin,
    categoryController.createCategory
);

module.exports = router;