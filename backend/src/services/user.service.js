const pool = require("../config/db");
const bcrypt = require("bcrypt");
const supabase = require("../config/supabase");

async function getUserProfile(userId) {
  const [users] = await pool.query(
    `
    SELECT
      id,
      username,
      email,
      avatar_url,
      role,
      created_at
    FROM users
    WHERE id = ?
    `,
    [userId]
  );

  if (users.length === 0) {
    throw new Error("Không tìm thấy người dùng");
  }

  return users[0];
}


async function updateUserProfile(
  userId,
  username,
  email,
  avatar_url
) {
  // Kiểm tra user tồn tại
  const [users] = await pool.query(
    `
    SELECT id
    FROM users
    WHERE id = ?
    `,
    [userId]
  );

  if (users.length === 0) {
    throw new Error("Không tìm thấy người dùng");
  }

  // Kiểm tra email đã được user khác sử dụng chưa
  const [existingEmail] = await pool.query(
    `
    SELECT id
    FROM users
    WHERE email = ?
      AND id != ?
    `,
    [email, userId]
  );

  if (existingEmail.length > 0) {
    throw new Error("Email đã được sử dụng");
  }

  // Cập nhật thông tin
  await pool.query(
    `
    UPDATE users
    SET
      username = ?,
      email = ?,
      avatar_url = ?
    WHERE id = ?
    `,
    [
      username,
      email,
      avatar_url || null,
      userId
    ]
  );

  // Lấy lại thông tin sau khi update
  const [updatedUsers] = await pool.query(
    `
    SELECT
      id,
      username,
      email,
      avatar_url,
      role,
      created_at
    FROM users
    WHERE id = ?
    `,
    [userId]
  );

  return updatedUsers[0];
}


async function changePassword(
  userId,
  currentPassword,
  newPassword
) {
  // 1. Lấy password_hash hiện tại
  const [users] = await pool.query(
    `
    SELECT password_hash
    FROM users
    WHERE id = ?
    `,
    [userId]
  );

  if (users.length === 0) {
    throw new Error("Không tìm thấy người dùng");
  }

  const user = users[0];

  // 2. Kiểm tra mật khẩu hiện tại
  const isPasswordCorrect =
    await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

  if (!isPasswordCorrect) {
    throw new Error(
      "Mật khẩu hiện tại không chính xác"
    );
  }

  // 3. Không cho dùng lại mật khẩu cũ
  const isSamePassword =
    await bcrypt.compare(
      newPassword,
      user.password_hash
    );

  if (isSamePassword) {
    throw new Error(
      "Mật khẩu mới phải khác mật khẩu hiện tại"
    );
  }

  // 4. Hash mật khẩu mới
  const newPasswordHash =
    await bcrypt.hash(newPassword, 10);

  // 5. Cập nhật database
  await pool.query(
    `
    UPDATE users
    SET password_hash = ?
    WHERE id = ?
    `,
    [newPasswordHash, userId]
  );

  return true;
}

async function uploadAvatar(
  userId,
  file
) {
  if (!file) {
    throw new Error("Vui lòng chọn file ảnh");
  }

  // Tạo tên file duy nhất
  const fileExtension =
    file.originalname
      .split(".")
      .pop()
      .toLowerCase();

  const fileName =
    `user-${userId}-${Date.now()}.${fileExtension}`;

  const filePath =
    `avatars/${fileName}`;

  // Upload lên Supabase Storage
  const { error: uploadError } =
    await supabase.storage
      .from("avatars")
      .upload(
        filePath,
        file.buffer,
        {
          contentType: file.mimetype,
          upsert: false
        }
      );

  if (uploadError) {
    throw new Error(
      `Upload avatar thất bại: ${uploadError.message}`
    );
  }

  // Lấy public URL
  const {
    data: publicUrlData
  } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const avatarUrl =
    publicUrlData.publicUrl;

  // Lưu URL vào database
  await pool.query(
    `
    UPDATE users
    SET avatar_url = ?
    WHERE id = ?
    `,
    [avatarUrl, userId]
  );

  return avatarUrl;
}


module.exports = {
  getUserProfile,updateUserProfile,changePassword,uploadAvatar
};