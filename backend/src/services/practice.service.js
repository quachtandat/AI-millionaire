const pool = require("../config/db");
const { practiceQuestionCount, adaptiveIncreaseThreshold, adaptiveDecreaseThreshold } = require("../config/learning.config");

async function recentAccuracy(connection, userId) {
  const [rows] = await connection.query(`SELECT AVG(recent.is_correct) AS accuracy
    FROM (SELECT ga.is_correct FROM game_answers ga JOIN games g ON g.id = ga.game_id
      WHERE g.user_id = ? ORDER BY ga.answered_at DESC LIMIT 10) recent`, [userId]);
  return rows[0].accuracy === null ? null : Number(rows[0].accuracy) * 100;
}

function chooseDifficulty(accuracy) {
  if (accuracy === null) return "easy";
  if (accuracy >= adaptiveIncreaseThreshold) return "hard";
  if (accuracy < adaptiveDecreaseThreshold) return "easy";
  return "medium";
}

async function chooseQuestion(connection, difficulty, categoryId, gameId) {
  const [usedRows] = gameId
    ? await connection.query("SELECT question_id FROM game_questions WHERE game_id = ?", [gameId])
    : [[]];
  const used = usedRows.map((row) => row.question_id);
  const alternatives = [difficulty, "medium", "easy", "hard"].filter((value, index, values) => values.indexOf(value) === index);
  for (const candidateDifficulty of alternatives) {
    for (const categoryFilter of categoryId ? [categoryId, null] : [null]) {
      const params = [candidateDifficulty];
      let filters = "WHERE q.status = 'approved' AND q.difficulty = ?";
      if (categoryFilter) { filters += " AND q.category_id = ?"; params.push(categoryFilter); }
      if (used.length) { filters += ` AND q.id NOT IN (${used.map(() => "?").join(",")})`; params.push(...used); }
      const [rows] = await connection.query(`SELECT q.id FROM questions q ${filters} ORDER BY RAND() LIMIT 1`, params);
      if (rows.length) return { id: rows[0].id, difficulty: candidateDifficulty };
    }
  }
  throw new Error("Không đủ 10 câu hỏi đã duyệt để tiếp tục Smart Practice");
}

async function startSmartQuiz(userId, requestedCategoryId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (requestedCategoryId) {
      const [categories] = await connection.query("SELECT id FROM categories WHERE id = ?", [requestedCategoryId]);
      if (!categories.length) throw new Error("Category not found");
    }
    const accuracy = await recentAccuracy(connection, userId);
    const difficulty = chooseDifficulty(accuracy);
    const [availableRows] = await connection.query("SELECT COUNT(*) AS total FROM questions WHERE status = 'approved'");
    if (Number(availableRows[0].total) < practiceQuestionCount) throw new Error(`Smart Practice cần ít nhất ${practiceQuestionCount} câu hỏi đã duyệt`);
    const [gameResult] = await connection.query(`INSERT INTO games
      (user_id, current_level, current_prize, status, game_mode, total_questions)
      VALUES (?, 1, 0, 'playing', 'practice', ?)`, [userId, practiceQuestionCount]);
    const gameId = gameResult.insertId;
    const selection = await chooseQuestion(connection, difficulty, requestedCategoryId, gameId);
    const questionId = selection.id;
    await connection.query(`INSERT INTO game_questions (game_id, question_id, level, order_number, question_started_at)
      VALUES (?, ?, 1, 1, NOW(3))`, [gameId, questionId]);
    await connection.commit();
    return { gameId, currentLevel: 1, totalQuestions: practiceQuestionCount, initialDifficulty: selection.difficulty, status: "playing" };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

module.exports = { startSmartQuiz, recentAccuracy, chooseDifficulty, chooseQuestion };
