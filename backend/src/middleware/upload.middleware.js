const multer = require("multer");

// Lưu file tạm trong memory
const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 20 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Chỉ chấp nhận file JPG, PNG hoặc WEBP"
        )
      );
    }

    cb(null, true);
  }
});

module.exports = upload;