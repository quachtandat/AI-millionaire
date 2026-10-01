const { DIFFICULTY_BY_LEVEL } = require("../config/game.config");


function validateQuestionData(data) {

    const {
        correct_answer,
        category_id,
        difficulty,
        prize_level
    } = data;


    // Kiểm tra đáp án
    const validAnswers = ["A", "B", "C", "D"];

    if (!validAnswers.includes(correct_answer)) {
        throw new Error(
            "correct_answer must be A, B, C or D"
        );
    }


    // Kiểm tra category_id
    if (
        !Number.isInteger(Number(category_id)) ||
        Number(category_id) <= 0
    ) {
        throw new Error(
            "category_id must be a valid positive integer"
        );
    }


    // Kiểm tra difficulty
    const validDifficulties = [
        "easy",
        "medium",
        "hard"
    ];

    if (!validDifficulties.includes(difficulty)) {
        throw new Error(
            "difficulty must be easy, medium or hard"
        );
    }


    // Kiểm tra prize level
    const level = Number(prize_level);

    if (
        !Number.isInteger(level) ||
        level < 1 ||
        level > 15
    ) {
        throw new Error(
            "prize_level must be between 1 and 15"
        );
    }


    // Kiểm tra difficulty có khớp level không
    const expectedDifficulty =
        DIFFICULTY_BY_LEVEL[level];

    if (difficulty !== expectedDifficulty) {
        throw new Error(
            `Prize level ${level} must have difficulty ${expectedDifficulty}`
        );
    }


    return true;
}


module.exports = {
    validateQuestionData
};