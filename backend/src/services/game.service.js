const pool = require("../config/db");

const {
    PRIZE_LEVELS,
    DIFFICULTY_BY_LEVEL
} = require("../config/game.config");


async function getRandomQuestionForLevel(connection, level) {
    const difficulty = DIFFICULTY_BY_LEVEL[level];

    const [rows] = await connection.query(
        `
        SELECT id
        FROM questions
        WHERE prize_level = ?
          AND difficulty = ?
          AND status = 'approved'
        ORDER BY RAND()
        LIMIT 1
        `,
        [level, difficulty]
    );

    if (rows.length === 0) {
        throw new Error(
            `Không tìm thấy câu hỏi cho level ${level} (${difficulty})`
        );
    }

    return rows[0].id;
}


async function startGame(userId) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Tạo game mới
        const [gameResult] = await connection.query(
            `
            INSERT INTO games
            (
                user_id,
                current_level,
                current_prize,
                status
            )
            VALUES (?, 1, 0, 'playing')
            `,
            [userId]
        );

        const gameId = gameResult.insertId;

        // 2. Chọn 15 câu hỏi
        for (let level = 1; level <= 15; level++) {
            const questionId = await getRandomQuestionForLevel(
                connection,
                level
            );

            const prize = PRIZE_LEVELS[level];

            await connection.query(
                `
                INSERT INTO game_questions
                (
                    game_id,
                    question_id,
                    level,
                    order_number
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    gameId,
                    questionId,
                    level,
                    level
                ]
            );
        }

        // 3. Commit transaction
        await connection.commit();

        return {
            gameId,
            currentLevel: 1,
            currentPrize: 0,
            status: "playing"
        };

    } catch (error) {

        // Có lỗi thì rollback toàn bộ
        await connection.rollback();

        throw error;

    } finally {

        // Luôn trả connection về pool
        connection.release();
    }
}


async function getGameById(gameId, userId) {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            user_id,
            current_level,
            current_prize,
            status,
            started_at,
            finished_at
        FROM games
        WHERE id = ?
          AND user_id = ?
        LIMIT 1
        `,
        [gameId, userId]
    );

    if (rows.length === 0) {
        throw new Error("Game không tồn tại");
    }

    return rows[0];
}


async function getCurrentQuestion(gameId, userId) {
    const [rows] = await pool.query(
        `
        SELECT
            g.id AS game_id,
            g.current_level,
            g.current_prize,
            g.status,

            gq.question_id,
            gq.level,

            q.question,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,

            q.category_id,
            c.name AS category_name,
            q.difficulty,
            q.prize_level

        FROM games g

        INNER JOIN game_questions gq
            ON g.id = gq.game_id
            AND g.current_level = gq.level

        INNER JOIN questions q
            ON gq.question_id = q.id

        LEFT JOIN categories c
            ON q.category_id = c.id

        WHERE g.id = ?
          AND g.user_id = ?
        LIMIT 1
        `,
        [gameId, userId]
    );

    if (rows.length === 0) {
        throw new Error("Không tìm thấy câu hỏi hiện tại");
    }

    return rows[0];
}

module.exports = {
    startGame,
    getGameById,
    getCurrentQuestion
};