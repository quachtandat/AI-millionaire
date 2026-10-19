const pool = require("../config/db");
const gameService = require("./game.service");
const config = require("../config/learning.config");

async function getKnowledgeProfile(userId) {
  const [stats, categories, difficulties, responseTime] = await Promise.all([
    gameService.getGameStatistics(userId),
    gameService.getCategoryStatistics(userId),
    gameService.getDifficultyStatistics(userId),
    gameService.getResponseTimeStatistics(userId)
  ]);
  const overallScore = stats.accuracy || 0;
  return {
    overallScore,
    strongTopics: categories.filter((item) => item.accuracy >= config.knowledgeStrongThreshold),
    weakTopics: categories.filter((item) => item.accuracy < config.knowledgeWeakThreshold),
    categories,
    difficulties,
    responseTime
  };
}

async function getRecommendations(userId) {
  const profile = await getKnowledgeProfile(userId);
  const recommendations = profile.weakTopics.slice(0, 5).map((topic) => ({
    categoryId: topic.categoryId,
    categoryName: topic.categoryName,
    difficulty: topic.accuracy < 40 ? "easy" : "medium",
    reason: `Độ chính xác của bạn ở chủ đề này là ${topic.accuracy}%.`
  }));
  if (!recommendations.length && profile.categories.length) {
    const topic = [...profile.categories].sort((a, b) => a.accuracy - b.accuracy)[0];
    recommendations.push({
      categoryId: topic.categoryId, categoryName: topic.categoryName,
      difficulty: "medium",
      reason: `Ôn tập thêm chủ đề này để duy trì độ chính xác ${topic.accuracy}%.`
    });
  }
  return { recommendations };
}

async function getAdminOverview() {
  const [users] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role = 'user'");
  const [games] = await pool.query("SELECT COUNT(*) AS total FROM games");
  const [questions] = await pool.query(`SELECT COUNT(*) AS total,
    SUM(source = 'ai') AS ai_questions,
    SUM(status = 'approved') AS approved_questions,
    SUM(status = 'rejected') AS rejected_questions,
    SUM(status = 'draft') AS draft_questions FROM questions`);
  const [gamesByStatus] = await pool.query("SELECT status, COUNT(*) AS total FROM games GROUP BY status");
  const [gameStats] = await pool.query(`SELECT AVG(current_prize) AS average_prize,
    AVG((SELECT AVG(ga.is_correct) FROM game_answers ga WHERE ga.game_id = g.id)) AS average_accuracy
    FROM games g`);
  const [popularCategories] = await pool.query(`SELECT c.id AS categoryId, c.name AS categoryName,
    COUNT(ga.question_id) AS answers,
    AVG(ga.is_correct) * 100 AS accuracy
    FROM game_answers ga JOIN questions q ON q.id = ga.question_id
    JOIN categories c ON c.id = q.category_id GROUP BY c.id, c.name
    ORDER BY answers DESC LIMIT 10`);
  const [popularQuestions] = await pool.query(`SELECT q.id AS questionId, q.question,
    COUNT(ga.id) AS answerCount, SUM(ga.is_correct = 0) AS incorrectCount,
    q.source FROM questions q LEFT JOIN game_answers ga ON ga.question_id = q.id
    GROUP BY q.id ORDER BY answerCount DESC LIMIT 10`);
  const [mostIncorrectQuestions] = await pool.query(`SELECT q.id AS questionId, q.question,
    COUNT(ga.id) AS answerCount, SUM(ga.is_correct = 0) AS incorrectCount,
    q.source FROM questions q JOIN game_answers ga ON ga.question_id = q.id
    GROUP BY q.id ORDER BY incorrectCount DESC, answerCount DESC LIMIT 10`);
  const [sourceStats] = await pool.query(`SELECT source, COUNT(*) AS total,
    SUM(status = 'approved') AS approved, SUM(status = 'rejected') AS rejected,
    SUM(status = 'draft') AS draft FROM questions GROUP BY source`);
  return {
    totalUsers: Number(users[0].total), totalGames: Number(games[0].total),
    ...Object.fromEntries(Object.entries(questions[0]).map(([key, value]) => [key, Number(value || 0)])),
    gamesByStatus: gamesByStatus.map((row) => ({ status: row.status, total: Number(row.total) })),
    averagePrize: Number(gameStats[0].average_prize || 0),
    averageAccuracy: Number(((gameStats[0].average_accuracy || 0) * 1).toFixed(2)),
    popularCategories: popularCategories.map((row) => ({ ...row, answers: Number(row.answers), accuracy: Number(Number(row.accuracy || 0).toFixed(2)) })),
    difficultCategories: [...popularCategories].sort((a, b) => Number(a.accuracy || 0) - Number(b.accuracy || 0)).slice(0, 10).map((row) => ({ ...row, answers: Number(row.answers), accuracy: Number(Number(row.accuracy || 0).toFixed(2)) })),
    popularQuestions: popularQuestions.map((row) => ({ ...row, answerCount: Number(row.answerCount), incorrectCount: Number(row.incorrectCount) })),
    mostIncorrectQuestions: mostIncorrectQuestions.map((row) => ({ ...row, answerCount: Number(row.answerCount), incorrectCount: Number(row.incorrectCount) })),
    questionSources: sourceStats.map((row) => ({ source: row.source, total: Number(row.total), approved: Number(row.approved), rejected: Number(row.rejected), draft: Number(row.draft) }))
  };
}

module.exports = { getKnowledgeProfile, getRecommendations, getAdminOverview };
