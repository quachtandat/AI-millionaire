const gameService = require("../services/game.service");

// POST /api/games/start
// Bắt đầu game
async function startGame(req, res) {
    try {

        // Lấy userId từ JWT
        const userId = req.user.userId;

        // Gọi service để tạo game
        const game = await gameService.startGame(userId);

        return res.status(201).json({
            success: true,
            message: "Bắt đầu game thành công",
            data: game
        });

    } catch (error) {

        console.error("START GAME ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Không thể bắt đầu game"
        });
    }
}


// Lấy game và câu hỏi hiện tại

async function getCurrentGame(req, res) {
    try {
        // ID game lấy từ URL
        const gameId = req.params.id;

        // ID user lấy từ JWT
        const userId = req.user.userId;

        // Lấy thông tin game
        const game = await gameService.getGameById(
            gameId,
            userId
        );

        // Lấy câu hỏi hiện tại
        const question = await gameService.getCurrentQuestion(
            gameId,
            userId
        );

        return res.status(200).json({
            success: true,
            data: {
                game,
                question
            }
        });

    } catch (error) {

        console.error("GET CURRENT GAME ERROR:", error);

        return res.status(404).json({
            success: false,
            message: error.message || "Không thể lấy game"
        });
    }
}

module.exports = {
    startGame, getCurrentGame
};