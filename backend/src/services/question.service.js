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
        source,
        page = 1,
        limit = 10
    } = filters;

    // Đảm bảo page và limit là số hợp lệ
    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(
        Math.max(Number(limit) || 10, 1),
        100
    );

    // Tính OFFSET
    const offset = (currentPage - 1) * perPage;
    // WHERE
    let whereClause = "WHERE 1=1";
    const params = [];

    if (category_id) {
        whereClause += " AND q.category_id = ?";
        params.push(category_id);
    }

    if (difficulty) {
        whereClause += " AND q.difficulty = ?";
        params.push(difficulty);
    }

    if (prize_level) {
        whereClause += " AND q.prize_level = ?";
        params.push(prize_level);
    }

    if (status) {
        whereClause += " AND q.status = ?";
        params.push(status);
    }

    if (source) {
        whereClause += " AND q.source = ?";
        params.push(source);
    }
    // COUNT TOTAL
    const [countRows] = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM questions q
        ${whereClause}
        `,
        params
    );

    const total = countRows[0].total;
    // GET QUESTIONS
    const [rows] = await pool.query(
        `
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
        ${whereClause}
        ORDER BY q.id DESC
        LIMIT ? OFFSET ?
        `,
        [...params, perPage, offset]
    );
    // PAGINATION INFO
    const totalPages = Math.ceil(total / perPage);

    return {
        questions: rows,
        pagination: {
            page: currentPage,
            limit: perPage,
            total,
            totalPages
        }
    };
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