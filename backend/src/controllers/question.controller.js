const questionService =
    require("../services/question.service");

async function createQuestion(req, res) {
    try {
        const data = req.body;

        const requiredFields = [
            "question",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "correct_answer",
            "category_id",
            "difficulty",
            "prize_level"
        ];

        for (const field of requiredFields) {
            if (
                data[field] === undefined ||
                data[field] === null ||
                data[field] === ""
            ) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        const result =
            await questionService.createQuestion(
                data,
                req.user.userId
            );

        res.status(201).json({
            success: true,
            message: "Question created successfully",
            data: result
        });

    } catch (error) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}


async function getQuestions(req, res) {
    try {

        const filters = {
            category_id: req.query.category_id,
            difficulty: req.query.difficulty,
            prize_level: req.query.prize_level,
            status: req.query.status,
            source: req.query.source
        };

        const questions =
            await questionService.getAllQuestions(
                filters
            );

        res.json({
            success: true,
            data: questions
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Cannot get questions"
        });
    }
}


async function getQuestion(req, res) {
    try {
        const { id } = req.params;

        const question =
            await questionService.getQuestionById(id);

        res.json({
            success: true,
            data: question
        });

    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
}


async function updateQuestion(req, res) {
    try {
        const { id } = req.params;

        const question =
            await questionService.updateQuestion(
                id,
                req.body
            );

        res.json({
            success: true,
            message: "Question updated successfully",
            data: question
        });

    } catch (error) {
        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}


async function deleteQuestion(req, res) {
    try {
        const { id } = req.params;

        await questionService.deleteQuestion(id);

        res.json({
            success: true,
            message: "Question deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(404).json({
            success: false,
            message: error.message
        });
    }
}


module.exports = {
    createQuestion,
    getQuestions,
    getQuestion,
    updateQuestion,
    deleteQuestion
};