const mongoose = require('mongoose');
const DB_URI = process.env.MONGODB_URI || "mongodb+srv://Web:1111@database.b0lr6f1.mongodb.net/onlineauction?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    const connOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(DB_URI, connOptions);
    console.log(`Kết nối MongoDB Atlas thành công!`);

  } catch (err) {
    console.error(`Kết nối MongoDB thất bại: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;