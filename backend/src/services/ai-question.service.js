const { ai } = require("../ai/ai.service");
const pool = require("../config/db");

async function generateQuestions({
    topic,
    difficulty,
    prize_level,
    count,
    language
}) {

    const prompt = `
You are an AI question generator for a "Who Wants to Be a Millionaire" quiz game.

Generate ${count} multiple-choice questions.

Topic: ${topic}
Difficulty: ${difficulty}
Prize level: ${prize_level}
Language: ${language}

Each question must have:
- question
- option_a
- option_b
- option_c
- option_d
- correct_answer
- explanation

Rules:
- correct_answer must be exactly A, B, C, or D.
- Only one option is correct.
- The question must match the requested difficulty.
- The question must match the requested topic.
- Do not include markdown.
- Return valid JSON only.

Return this format:

{
    "questions": [
        {
            "question": "...",
            "option_a": "...",
            "option_b": "...",
            "option_c": "...",
            "option_d": "...",
            "correct_answer": "A",
            "explanation": "..."
        }
    ]
}
`;

    let response;

    for (let attempt = 1; attempt <= 5; attempt++) {
        try {
            response = await ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: prompt
            });

            break;

        } catch (error) {

            console.error(
                `AI request failed - attempt ${attempt}`
            );

            if (
                error.status === 503 &&
                attempt < 3
            ) {
                await new Promise(resolve =>
                    setTimeout(resolve, 2000)
                );

                continue;
            }

            throw error;
        }
    }


    const text = response.text;

    let parsed;

    try {
        parsed = JSON.parse(text);
    } catch (error) {
        throw new Error("AI returned invalid JSON");
    }

    // Kiểm tra questions
    if (
        !parsed ||
        !Array.isArray(parsed.questions)
    ) {
        throw new Error(
            "AI response must contain a questions array"
        );
    }

    // Validate từng question
    for (const question of parsed.questions) {

        const requiredFields = [
            "question",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "correct_answer",
            "explanation"
        ];

        for (const field of requiredFields) {

            if (
                question[field] === undefined ||
                question[field] === null ||
                question[field] === ""
            ) {
                throw new Error(
                    `AI question missing field: ${field}`
                );
            }
        }

        // Validate đáp án
        if (
            !["A", "B", "C", "D"]
                .includes(question.correct_answer)
        ) {
            throw new Error(
                "Invalid correct_answer"
            );
        }
    }

    return parsed;
}


async function saveAIQuestions(
    questions,
    userId,
    categoryId,
    difficulty,
    prizeLevel
) {
    const savedQuestions = [];

    for (const question of questions) {

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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 'ai', ?)`,
            [
                question.question,
                question.option_a,
                question.option_b,
                question.option_c,
                question.option_d,
                question.correct_answer,
                categoryId,
                difficulty,
                prizeLevel,
                question.explanation || null,
                userId
            ]
        );

        savedQuestions.push({
            id: result.insertId,
            ...question,
            category_id: categoryId,
            difficulty,
            prize_level: prizeLevel,
            status: "draft",
            source: "ai",
            created_by: userId
        });
    }

    return savedQuestions;
}


async function getAIDraftQuestions() {
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
         LEFT JOIN categories c
            ON q.category_id = c.id
         WHERE q.status = 'draft'
           AND q.source = 'ai'
         ORDER BY q.id DESC`
    );

    return rows;
}


async function approveAIQuestion(questionId) {

    const [rows] = await pool.query(
        `SELECT
            id,
            status,
            source
         FROM questions
         WHERE id = ?`,
        [questionId]
    );

    if (rows.length === 0) {
        throw new Error("Question not found");
    }

    const question = rows[0];

    // Chỉ cho phép approve câu hỏi được tạo bởi AI
    if (question.source !== "ai") {
        throw new Error(
            "Only AI questions can be approved here"
        );
    }

    // Chỉ draft mới được approve
    if (question.status !== "draft") {
        throw new Error(
            "Only draft questions can be approved"
        );
    }

    await pool.query(
        `UPDATE questions
         SET status = 'approved'
         WHERE id = ?`,
        [questionId]
    );

    const [updatedRows] = await pool.query(
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
         LEFT JOIN categories c
            ON q.category_id = c.id
         WHERE q.id = ?`,
        [questionId]
    );

    return updatedRows[0];
}


async function rejectAIQuestion(questionId) {
    // 1. Kiểm tra câu hỏi có tồn tại không
    const [rows] = await pool.query(
        `SELECT id, status, source
         FROM questions
         WHERE id = ?`,
        [questionId]
    );

    if (rows.length === 0) {
        throw new Error("Question not found");
    }

    const question = rows[0];

    // 2. Chỉ cho phép reject câu hỏi được tạo bởi AI
    if (question.source !== "ai") {
        throw new Error("Only AI questions can be rejected here");
    }

    // 3. Chỉ reject câu hỏi đang ở trạng thái draft
    if (question.status !== "draft") {
        throw new Error("Only draft questions can be rejected");
    }

    // 4. Chuyển status từ draft -> rejected
    await pool.query(
        `UPDATE questions
         SET status = 'rejected'
         WHERE id = ?`,
        [questionId]
    );

    // 5. Lấy lại dữ liệu sau khi update
    const [updatedRows] = await pool.query(
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
         LEFT JOIN categories c
             ON q.category_id = c.id
         WHERE q.id = ?`,
        [questionId]
    );

    return updatedRows[0];
}

module.exports = {
    generateQuestions,saveAIQuestions,getAIDraftQuestions,approveAIQuestion,rejectAIQuestion
};