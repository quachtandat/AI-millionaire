const gameService = require("../services/game.service");

// POST /api/games/start

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


module.exports = {
    startGame
};