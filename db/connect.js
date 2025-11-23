const mongoose = require('mongoose');
require('dotenv').config();
const DB_URI = process.env.MONGODB_URI || "mongodb+srv://Web:1111@database.b0lr6f1.mongodb.net/onlineauction?retryWrites=true&w=majority";

const connectDB = async () => {
  if (!DB_URI) {
    console.error("[MONGOOSE] Lỗi: Không tìm thấy biến môi trường MONGODB_URI trong file .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(DB_URI);

    console.log(`[MONGOOSE] Kết nối MongoDB Atlas thành công!`);
    console.log(`[MONGOOSE] Host: ${mongoose.connection.host}`);

  } catch (err) {
    console.error(`[MONGOOSE] Kết nối MongoDB thất bại: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;