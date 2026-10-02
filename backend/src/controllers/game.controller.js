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

// POST /api/games/:id/timeout
async function timeoutCurrentGame(req, res) {
  try {
    const gameId = req.params.id;
    const userId = req.user.userId;
    const expectedLevel = Number(req.body.expectedLevel);

    if (!Number.isInteger(expectedLevel) || expectedLevel < 1 || expectedLevel > 15) {
      return res.status(400).json({ success: false, message: "expectedLevel must be between 1 and 15" });
    }

    const result = await gameService.timeoutGame(gameId, userId, expectedLevel);
    return res.status(200).json({
      success: true,
      message: result.timedOut ? "Hết thời gian trả lời" : "Game đã chuyển sang trạng thái mới",
      data: result
    });
  } catch (error) {
    console.error("TIMEOUT GAME ERROR:", error);
    return res.status(400).json({ success: false, message: error.message || "Không thể kết thúc game khi hết giờ" });
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


// Game detail
async function getGameDetail(req, res) {
  try {
    const gameId = req.params.id;
    const userId = req.user.userId;

    const result = await gameService.getGameDetail(
      gameId,
      userId
    );

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("GET GAME DETAIL ERROR:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Không thể lấy chi tiết game"
    });
  }
}


// rank
async function getGameRanking(req, res) {
  try {
    // Có thể truyền ?limit=20
    const limit = req.query.limit || 20;

    const ranking = await gameService.getGameRanking(limit);

    return res.status(200).json({
      success: true,
      data: ranking
    });
  } catch (error) {
    console.error("GET GAME RANKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy bảng xếp hạng"
    });
  }
}


// Personal Statistics
async function getGameStatistics(req, res) {
  try {
    const userId = req.user.userId;

    const statistics = await gameService.getGameStatistics(
      userId
    );

    return res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error("GET GAME STATISTICS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy thống kê game"
    });
  }
}


// 50:50
async function useFiftyFifty(req, res) {
  try {
    const gameId = req.params.id;
    const userId = req.user.userId;

    const result = await gameService.useFiftyFifty(
      gameId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Sử dụng quyền trợ giúp 50:50 thành công",
      data: result
    });
  } catch (error) {
    console.error("USE FIFTY-FIFTY ERROR:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Không thể sử dụng quyền trợ giúp 50:50"
    });
  }
}


// Audience
async function useAudience(req, res) {
  try {
    const gameId = req.params.id;
    const userId = req.user.userId;

    const result = await gameService.useAudience(
      gameId,
      userId
    );

    return res.status(200).json({
      success: true,
      message:
        "Sử dụng quyền trợ giúp Audience thành công",
      data: result
    });
  } catch (error) {
    console.error("USE AUDIENCE ERROR:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Không thể sử dụng quyền trợ giúp Audience"
    });
  }
}


// phone
async function usePhone(req, res) {
  try {
    const gameId = req.params.id;
    const userId = req.user.userId;

    const result = await gameService.usePhone(
      gameId,
      userId
    );

    return res.status(200).json({
      success: true,
      message:
        "Sử dụng quyền trợ giúp Phone thành công",
      data: result
    });
  } catch (error) {
    console.error("USE PHONE ERROR:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Không thể sử dụng quyền trợ giúp Phone"
    });
  }
}

module.exports = {
    startGame, getCurrentGame,answerQuestion,timeoutCurrentGame,stopCurrentGame,getGameHistory,getGameDetail,getGameRanking,getGameStatistics,useFiftyFifty,useAudience,usePhone
};