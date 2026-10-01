const aiQuestionService = require("../services/ai-question.service");

async function generateQuestions(req, res) {
    try {

        const {
            topic,
            difficulty,
            prize_level,
            count,
            language,
            category_id
        } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                message: "topic is required"
            });
        }

        if (!difficulty) {
            return res.status(400).json({
                success: false,
                message: "difficulty is required"
            });
        }

        if (!prize_level) {
            return res.status(400).json({
                success: false,
                message: "prize_level is required"
            });
        }

        if (!count) {
            return res.status(400).json({
                success: false,
                message: "count is required"
            });
        }

        if (!category_id) {
            return res.status(400).json({
                success: false,
                message: "category_id is required"
            });
        }

        const result =
            await aiQuestionService.generateQuestions({
                topic,
                difficulty,
                prize_level,
                count,
                language: language || "vi"
            });

        res.json({
            success: true,
            data: result
        });



        const savedQuestions =
            await aiQuestionService.saveAIQuestions(
                result.questions,
                req.user.userId,
                category_id,
                difficulty,
                prize_level
        );

        res.json({
            success: true,
            message: "AI questions generated successfully",
            data: savedQuestions
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "AI generation failed"
        });
    }
}


async function getAIDraftQuestions(req, res) {
    try {

        const questions =
            await aiQuestionService.getAIDraftQuestions();

        res.json({
            success: true,
            data: questions
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Cannot get AI draft questions"
        });
    }
}


async function approveAIQuestion(req, res) {
    try {

        const { id } = req.params;

        const question =
            await aiQuestionService.approveAIQuestion(id);

        res.json({
            success: true,
            message: "AI question approved successfully",
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


async function rejectAIQuestion(req, res) {
    try {
        const { id } = req.params;

        const question =
            await aiQuestionService.rejectAIQuestion(id);

        res.json({
            success: true,
            message: "AI question rejected successfully",
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

module.exports = {
    generateQuestions,getAIDraftQuestions,approveAIQuestion,rejectAIQuestion
};