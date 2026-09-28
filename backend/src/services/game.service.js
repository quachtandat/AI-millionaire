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

// Trả lời câu hỏi hiện tại
async function answerCurrentQuestion(gameId, userId, selectedAnswer) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Kiểm tra đáp án hợp lệ
        const validAnswers = ["A", "B", "C", "D"];

        if (!validAnswers.includes(selectedAnswer)) {
            throw new Error(
                "Đáp án không hợp lệ. Chỉ được chọn A, B, C hoặc D."
            );
        }

        // 2. Lấy game hiện tại
        const [games] = await connection.query(
            `
            SELECT
                id,
                user_id,
                current_level,
                current_prize,
                status
            FROM games
            WHERE id = ?
              AND user_id = ?
            LIMIT 1
            `,
            [gameId, userId]
        );


        if (games.length === 0) {
            throw new Error("Game không tồn tại");
        }


        const game = games[0];

        // 3. Kiểm tra game còn đang chơi không
        if (game.status !== "playing") {
            throw new Error("Game đã kết thúc");
        }

        // 4. Lấy câu hỏi hiện tại
        const [questions] = await connection.query(
            `
            SELECT
                q.id,
                q.question,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.correct_answer,
                q.explanation,
                q.prize_level
            FROM game_questions gq

            INNER JOIN questions q
                ON gq.question_id = q.id

            WHERE gq.game_id = ?
              AND gq.level = ?
            LIMIT 1
            `,
            [
                gameId,
                game.current_level
            ]
        );


        if (questions.length === 0) {
            throw new Error(
                "Không tìm thấy câu hỏi hiện tại"
            );
        }

        const question = questions[0];

        // 5. Kiểm tra đáp án
        const isCorrect =
            selectedAnswer === question.correct_answer;

        // 6. Lưu câu trả lời
        await connection.query(
            `
            INSERT INTO game_answers
            (
                game_id,
                question_id,
                selected_answer,
                is_correct
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                gameId,
                question.id,
                selectedAnswer,
                isCorrect
            ]
        );

        // 7. Nếu trả lời SAI
        if (!isCorrect) {
            await connection.query(
                `
                UPDATE games
                SET
                    status = 'lost',
                    finished_at = NOW()
                WHERE id = ?
                `,
                [gameId]
            );

            await connection.commit();

            return {
                gameOver: true,
                isCorrect: false,
                gameStatus: "lost",
                currentLevel: game.current_level,
                currentPrize: game.current_prize,
                correctAnswer: question.correct_answer,
                explanation: question.explanation
            };
        }

        // 8. Nếu trả lời ĐÚNG
        const currentLevel = game.current_level;

        // 9. Nếu thắng level 15
        if (currentLevel === 15) {
            const finalPrize = PRIZE_LEVELS[15];

            await connection.query(
                `
                UPDATE games
                SET
                    current_prize = ?,
                    status = 'won',
                    finished_at = NOW()
                WHERE id = ?
                `,
                [
                    finalPrize,
                    gameId
                ]
            );

            await connection.commit();

            return {
                gameOver: true,
                isCorrect: true,
                gameStatus: "won",
                currentLevel: 15,
                currentPrize: finalPrize,
                message: "Chúc mừng! Bạn đã thắng 1 tỷ đồng!"
            };
        }

        // 10. Sang level tiếp theo
        const nextLevel = currentLevel + 1;
        const nextPrize = PRIZE_LEVELS[nextLevel];

        await connection.query(
            `
            UPDATE games
            SET
                current_level = ?,
                current_prize = ?
            WHERE id = ?
            `,
            [
                nextLevel,
                nextPrize,
                gameId
            ]
        );

        // 11. Lấy câu hỏi tiếp theo
        const [nextQuestions] = await connection.query(
            `
            SELECT
                q.id AS question_id,
                q.question,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.category_id,
                c.name AS category_name,
                q.difficulty,
                q.prize_level

            FROM game_questions gq

            INNER JOIN questions q
                ON gq.question_id = q.id

            LEFT JOIN categories c
                ON q.category_id = c.id

            WHERE gq.game_id = ?
              AND gq.level = ?
            LIMIT 1
            `,
            [
                gameId,
                nextLevel
            ]
        );

        if (nextQuestions.length === 0) {
            throw new Error(
                "Không tìm thấy câu hỏi tiếp theo"
            );
        }

        const nextQuestion = nextQuestions[0];

        // 12. Commit
        await connection.commit();

        // 13. Trả kết quả
        return {
            gameOver: false,
            isCorrect: true,
            gameStatus: "playing",
            currentLevel: nextLevel,
            currentPrize: nextPrize,
            question: nextQuestion
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// stop game
async function stopGame(gameId, userId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // 1. Tìm game của user hiện tại
    const [games] = await connection.query(
      `
      SELECT
        id,
        user_id,
        current_level,
        current_prize,
        status
      FROM games
      WHERE id = ?
        AND user_id = ?
      FOR UPDATE
      `,
      [gameId, userId]
    );

    if (games.length === 0) {
      throw new Error("Game không tồn tại");
    }

    const game = games[0];

    // 2. Chỉ game đang chơi mới được dừng
    if (game.status !== "playing") {
      throw new Error(
        `Không thể dừng game vì game hiện đang ở trạng thái: ${game.status}`
      );
    }

    // 3. Cập nhật game thành stopped
    await connection.query(
      `
      UPDATE games
      SET
        status = 'stopped',
        finished_at = NOW()
      WHERE id = ?
      `,
      [gameId]
    );

    await connection.commit();

    // 4. Trả kết quả về
    return {
      gameId: game.id,
      status: "stopped",
      currentLevel: game.current_level,
      currentPrize: game.current_prize
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}


// history game
async function getGameHistory(userId) {
  const [games] = await pool.query(
    `
    SELECT
      id,
      current_level,
      current_prize,
      status,
      started_at,
      finished_at
    FROM games
    WHERE user_id = ?
    ORDER BY started_at DESC
    `,
    [userId]
  );

  return games.map((game) => ({
    gameId: game.id,
    currentLevel: game.current_level,
    currentPrize: game.current_prize,
    status: game.status,
    startedAt: game.started_at,
    finishedAt: game.finished_at
  }));
}


module.exports = {
    startGame,
    getGameById,
    getCurrentQuestion,
    answerCurrentQuestion,
    stopGame,
    getGameHistory
};