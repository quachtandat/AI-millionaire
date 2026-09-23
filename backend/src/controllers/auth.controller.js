const authService = require("../services/auth.service");
const pool = require("../config/db");

async function register(req, res) {
    try {
        const {
            username,
            email,
            password
        } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Username, email and password are required"
            });
        }

        // Đăng ký user
        const user = await authService.registerUser(
            username,
            email,
            password
        );

        return res.status(201).json({
            success: true,
            message: "Register successfully",
            data: user
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

async function login(req, res) {
    try {
        const {
            email,
            password
        } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Login
        const result = await authService.loginUser(
            email,
            password
        );

        return res.status(200).json({
            success: true,
            message: "Login successfully",
            data: result
        });

    } catch (error) {
        console.error(error);

        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
}

async function getMe(req, res) {
    try {
        const userId = req.user.userId;

        const [users] = await pool.query(
            `SELECT
                id,
                username,
                email,
                avatar_url,
                role,
                created_at
             FROM users
             WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

module.exports = {
    register,
    login,
    getMe
};