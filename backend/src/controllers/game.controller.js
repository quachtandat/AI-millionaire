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

// POST /api/games/:id/answer
// Trả lời câu hỏi hiện tại
async function answerQuestion(req, res) {
    try {

        const gameId = req.params.id;

        const userId = req.user.userId;

        const { selectedAnswer } = req.body;


        if (!selectedAnswer) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn đáp án"
            });
        }


        const result =
            await gameService.answerCurrentQuestion(
                gameId,
                userId,
                selectedAnswer
            );


        return res.status(200).json({
            success: true,
            message: result.isCorrect
                ? "Trả lời đúng"
                : "Trả lời sai",

            data: result
        });

    } catch (error) {

        console.error(
            "ANSWER QUESTION ERROR:",
            error
        );


        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}


// stop game
async function stopCurrentGame(req, res) {
  try {
    const gameId = req.params.id;
    const userId = req.user.userId;

    const result = await gameService.stopGame(gameId, userId);

    return res.status(200).json({
      success: true,
      message: "Dừng game thành công",
      data: result
    });
  } catch (error) {
    console.error("STOP GAME ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Không thể dừng game"
    });
  }
}


// get history game
async function getGameHistory(req, res) {
  try {
    // Lấy userId từ JWT
    const userId = req.user.userId;

    // Gọi service để lấy lịch sử game
    const games = await gameService.getGameHistory(userId);

    return res.status(200).json({
      success: true,
      data: games
    });
  } catch (error) {
    console.error("GET GAME HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy lịch sử game"
    });
  }
}

module.exports = {
    startGame, getCurrentGame,answerQuestion,stopCurrentGame,getGameHistory
};