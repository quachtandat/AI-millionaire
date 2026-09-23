const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../config/db");

async function registerUser(username, email, password) {
    // Kiểm tra email đã tồn tại chưa
    const [existingUsers] = await pool.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
    );

    if (existingUsers.length > 0) {
        throw new Error("Email already exists");
    }

    // Kiểm tra username đã tồn tại chưa
    const [existingUsername] = await pool.query(
        "SELECT id FROM users WHERE username = ?",
        [username]
    );

    if (existingUsername.length > 0) {
        throw new Error("Username already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Lưu user vào database
    const [result] = await pool.query(
        `INSERT INTO users
        (username, email, password_hash)
        VALUES (?, ?, ?)`,
        [username, email, passwordHash]
    );

    return {
        id: result.insertId,
        username,
        email
    };
}

async function loginUser(email, password) {
    // Tìm user theo email
    const [users] = await pool.query(
        `SELECT
            id,
            username,
            email,
            password_hash,
            avatar_url,
            role
         FROM users
         WHERE email = ?`,
        [email]
    );

    if (users.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = users[0];

    // So sánh password người dùng nhập
    // với password hash trong database
    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isPasswordCorrect) {
        throw new Error("Invalid email or password");
    }

    // Tạo JWT
    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url,
            role: user.role
        }
    };
}

module.exports = {
    registerUser,
    loginUser
};