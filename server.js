<<<<<<< HEAD
const mongoose = require('mongoose');
const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/primesound';

const startServer = async () => {
    try {
        // 1. Kết nối MongoDB trước
        await mongoose.connect(MONGO_URI);
        console.log('✅ Đã kết nối thành công với MongoDB!');

        // 2. Sau khi DB ok, mới start server
        app.listen(PORT, () => {
            console.log(`🚀 PrimeSound Server đang chạy tại http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Lỗi kết nối cơ sở dữ liệu:', error.message);
        // Thoát process nếu không kết nối được DB
        process.exit(1);
    }
};

<<<<<<< HEAD
startServer();
=======
startServer();
>>>>>>> origin/feature/auth-and-profile-apis
=======
// server.js
const mongoose = require('mongoose');
const app = require('./src/app'); // Import app từ file app.js
require('dotenv').config(); // Load các biến môi trường từ file .env

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/primesound_db';

// Hàm khởi động server
const startServer = async () => {
  try {
    // 1. Kết nối với MongoDB trước
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối thành công với MongoDB!');

    // 2. Nếu DB kết nối thành công, mới bắt đầu lắng nghe request ở Port
    app.listen(PORT, () => {
      console.log(`🚀 PrimeSound Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    // Nếu lỗi DB, log ra và dừng toàn bộ ứng dụng (tránh tình trạng server chạy nhưng query lỗi)
    console.error('❌ Lỗi kết nối cơ sở dữ liệu:', error.message);
    process.exit(1); 
  }
};

startServer();
>>>>>>> origin/feature/search-and-playlist-apis
