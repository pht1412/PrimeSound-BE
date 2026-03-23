const mongoose = require('mongoose');
const app = require('./src/app.js');
const dotenv = require('dotenv');
dotenv.config();

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

startServer();
