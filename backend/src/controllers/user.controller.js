const userService = require("../services/user.service");

async function getUserProfile(req, res) {
  try {
    const userId = req.user.userId;

    const user = await userService.getUserProfile(userId);

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("GET USER PROFILE ERROR:", error);

    return res.status(404).json({
      success: false,
      message:
        error.message ||
        "Không thể lấy thông tin người dùng"
    });
  }
}


async function updateUserProfile(req, res) {
  try {
    const userId = req.user.userId;

    const {
      username,
      email,
      avatar_url
    } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: "Username và email là bắt buộc"
      });
    }

    const updatedUser =
      await userService.updateUserProfile(
        userId,
        username,
        email,
        avatar_url
      );

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: updatedUser
    });

  } catch (error) {
    console.error(
      "UPDATE USER PROFILE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Không thể cập nhật thông tin"
    });
  }
}

async function changePassword(req, res) {
  try {
    const userId = req.user.userId;

    const {
      currentPassword,
      newPassword
    } = req.body;

    // Kiểm tra dữ liệu
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "currentPassword và newPassword là bắt buộc"
      });
    }

    // Kiểm tra độ dài
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Mật khẩu mới phải có ít nhất 6 ký tự"
      });
    }

    await userService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công"
    });

  } catch (error) {
    console.error(
      "CHANGE PASSWORD ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Không thể đổi mật khẩu"
    });
  }
}

async function uploadAvatar(req, res) {
  try {
    const userId = req.user.userId;

    const avatarUrl =
      await userService.uploadAvatar(
        userId,
        req.file
      );

    return res.status(200).json({
      success: true,
      message: "Upload avatar thành công",
      data: {
        avatar_url: avatarUrl
      }
    });

  } catch (error) {
    console.error(
      "UPLOAD AVATAR ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Không thể upload avatar"
    });
  }
}

module.exports = {
  getUserProfile,updateUserProfile,changePassword,uploadAvatar
};