const pool = require("../config/db");

async function getAllCategories() {
    const [rows] = await pool.query(
        `SELECT
            id,
            name,
            description,
            created_at
         FROM categories
         ORDER BY id ASC`
    );

    return rows;
}

async function createCategory(name, description) {
    const [existing] = await pool.query(
        `SELECT id
         FROM categories
         WHERE name = ?`,
        [name]
    );

    if (existing.length > 0) {
        throw new Error("Category already exists");
    }

    const [result] = await pool.query(
        `INSERT INTO categories
        (name, description)
        VALUES (?, ?)`,
        [name, description || null]
    );

    return {
        id: result.insertId,
        name,
        description: description || null
    };
}

module.exports = {
    getAllCategories,
    createCategory
};