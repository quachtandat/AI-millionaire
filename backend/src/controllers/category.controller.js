const categoryService = require("../services/category.service");

async function getCategories(req, res) {
    try {
        const categories =
            await categoryService.getAllCategories();

        res.json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Cannot get categories"
        });
    }
}

async function createCategory(req, res) {
    try {
        const {
            name,
            description
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const category =
            await categoryService.createCategory(
                name,
                description
            );

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });

    } catch (error) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    getCategories,
    createCategory
};