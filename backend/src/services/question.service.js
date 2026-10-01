const pool = require("../config/db");

async function createQuestion(data, userId) {
    const {
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        category_id,
        difficulty,
        prize_level,
        explanation
    } = data;

    // Kiểm tra category
    const [categories] = await pool.query(
        `SELECT id
         FROM categories
         WHERE id = ?`,
        [category_id]
    );

    if (categories.length === 0) {
        throw new Error("Category not found");
    }

    // Insert question
    const [result] = await pool.query(
        `INSERT INTO questions (
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            category_id,
            difficulty,
            prize_level,
            explanation,
            status,
            source,
            created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 'admin', ?)`,
        [
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            category_id,
            difficulty,
            prize_level,
            explanation || null,
            userId
        ]
    );

    return {
        id: result.insertId,
        ...data,
        status: "approved",
        source: "admin",
        created_by: userId
    };
}


async function getAllQuestions(filters = {}) {

    const {
        category_id,
        difficulty,
        prize_level,
        status,
        source
    } = filters;

    let sql = `
        SELECT
            q.id,
            q.question,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_answer,
            q.category_id,
            c.name AS category_name,
            q.difficulty,
            q.prize_level,
            q.explanation,
            q.status,
            q.source,
            q.created_by,
            q.created_at
        FROM questions q
        JOIN categories c
            ON q.category_id = c.id
        WHERE 1 = 1
    `;

    const params = [];

    // Lọc theo category
    if (category_id !== undefined) {
        sql += ` AND q.category_id = ?`;
        params.push(category_id);
    }

    // Lọc theo difficulty
    if (difficulty !== undefined) {
        sql += ` AND q.difficulty = ?`;
        params.push(difficulty);
    }

    // Lọc theo prize level
    if (prize_level !== undefined) {
        sql += ` AND q.prize_level = ?`;
        params.push(prize_level);
    }

    // Lọc theo status
    if (status !== undefined) {
        sql += ` AND q.status = ?`;
        params.push(status);
    }

    // Lọc theo source
    if (source !== undefined) {
        sql += ` AND q.source = ?`;
        params.push(source);
    }

    sql += `
        ORDER BY q.id DESC
    `;

    const [rows] = await pool.query(
        sql,
        params
    );

    return rows;
}


async function getQuestionById(id) {
    const [rows] = await pool.query(
        `SELECT
            q.id,
            q.question,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_answer,
            q.category_id,
            c.name AS category_name,
            q.difficulty,
            q.prize_level,
            q.explanation,
            q.status,
            q.source,
            q.created_by,
            q.created_at
         FROM questions q
         JOIN categories c
            ON q.category_id = c.id
         WHERE q.id = ?`,
        [id]
    );

    if (rows.length === 0) {
        throw new Error("Question not found");
    }

    return rows[0];
}


async function updateQuestion(id, data) {
    const {
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        category_id,
        difficulty,
        prize_level,
        explanation,
        status
    } = data;

    const [existing] = await pool.query(
        `SELECT id
         FROM questions
         WHERE id = ?`,
        [id]
    );

    if (existing.length === 0) {
        throw new Error("Question not found");
    }

    const [categories] = await pool.query(
        `SELECT id FROM categories WHERE id = ?`,
        [category_id]
    );

    if (categories.length === 0) {
        throw new Error("Category not found");
    }

    await pool.query(
        `UPDATE questions
         SET
            question = ?,
            option_a = ?,
            option_b = ?,
            option_c = ?,
            option_d = ?,
            correct_answer = ?,
            category_id = ?,
            difficulty = ?,
            prize_level = ?,
            explanation = ?,
            status = ?
         WHERE id = ?`,
        [
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            category_id,
            difficulty,
            prize_level,
            explanation || null,
            status,
            id
        ]
    );

    return await getQuestionById(id);
}


async function deleteQuestion(id) {
    const [existing] = await pool.query(
        `SELECT id
         FROM questions
         WHERE id = ?`,
        [id]
    );

    if (existing.length === 0) {
        throw new Error("Question not found");
    }

    await pool.query(
        `DELETE FROM questions
         WHERE id = ?`,
        [id]
    );

    return true;
}


module.exports = {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
};