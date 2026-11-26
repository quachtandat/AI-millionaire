const test = require("node:test");
const assert = require("node:assert/strict");
const { chooseDifficulty } = require("../src/services/practice.service");
const quality = require("../src/services/ai-question-quality.service");

test("adaptive difficulty uses recent accuracy thresholds", () => {
  assert.equal(chooseDifficulty(null), "easy");
  assert.equal(chooseDifficulty(59.9), "easy");
  assert.equal(chooseDifficulty(60), "medium");
  assert.equal(chooseDifficulty(79.9), "medium");
  assert.equal(chooseDifficulty(80), "hard");
});

test("question normalization ignores case and repeated whitespace", () => {
  assert.equal(quality.normalizeQuestionText("  Thủ   đô HÀ NỘI? "), "thủ đô hà nội?");
});

test("quality score flags duplicate options and missing explanation", () => {
  const result = quality.scoreQuestion({
    question: "Example?", option_a: "Same", option_b: "Same", option_c: "Other", option_d: "Last",
    correct_answer: "A", category_id: 1, difficulty: "easy", prize_level: 1, explanation: ""
  });
  assert.ok(result.score < 100);
  assert.ok(result.issues.includes("Answer options must be unique"));
  assert.ok(result.issues.includes("explanation is required"));
});
