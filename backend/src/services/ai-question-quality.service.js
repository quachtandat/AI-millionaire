const pool = require("../config/db");
const { aiQuestionQualityThreshold } = require("../config/learning.config");

function normalizeQuestionText(value) {
  return String(value || "").normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function scoreQuestion(question, duplicate = false) {
  const issues = [];
  let score = 100;
  const fields = ["question", "option_a", "option_b", "option_c", "option_d", "explanation"];
  fields.forEach((field) => {
    if (!String(question[field] || "").trim()) {
      issues.push(`${field} is required`);
      score -= field === "explanation" ? 10 : 20;
    }
  });
  const options = [question.option_a, question.option_b, question.option_c, question.option_d]
    .map(normalizeQuestionText);
  if (new Set(options).size !== 4) {
    issues.push("Answer options must be unique");
    score -= 25;
  }
  if (!["A", "B", "C", "D"].includes(question.correct_answer)) {
    issues.push("correct_answer must be A, B, C or D");
    score -= 25;
  }
  if (!Number.isInteger(Number(question.category_id)) || Number(question.category_id) < 1) {
    issues.push("A valid category is required");
    score -= 15;
  }
  if (!["easy", "medium", "hard"].includes(question.difficulty) ||
      !Number.isInteger(Number(question.prize_level)) || Number(question.prize_level) < 1 || Number(question.prize_level) > 15) {
    issues.push("Difficulty and prize level must be valid");
    score -= 15;
  }
  if (duplicate) {
    issues.push("Duplicate question in the same category");
    score -= 40;
  }
  return { score: Math.max(0, score), issues, eligible: score >= aiQuestionQualityThreshold && !duplicate };
}

async function assess(question) {
  const [rows] = await pool.query(
    question.id
      ? "SELECT question FROM questions WHERE category_id = ? AND id <> ?"
      : "SELECT question FROM questions WHERE category_id = ?",
    question.id ? [question.category_id, question.id] : [question.category_id]
  );
  const candidate = normalizeQuestionText(question.question);
  const duplicate = rows.some((row) => normalizeQuestionText(row.question) === candidate);
  return scoreQuestion(question, duplicate);
}

module.exports = { normalizeQuestionText, scoreQuestion, assess };
