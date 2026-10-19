module.exports = {
  knowledgeStrongThreshold: 80,
  knowledgeWeakThreshold: 60,
  adaptiveIncreaseThreshold: 80,
  adaptiveDecreaseThreshold: 60,
  aiQuestionQualityThreshold: Number(process.env.AI_QUESTION_QUALITY_THRESHOLD || 70),
  practiceQuestionCount: 10
};
