const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const http = require('http');
const app = require('./src/app.js');
const socket = require('./src/socket.js');


const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI ;

// 1. Tạo server HTTP từ app Express
const server = http.createServer(app);

// 2. Khởi tạo Socket.io trên server HTTP này
const io = socket.init(server);

// 3. Lắng nghe các sự kiện kết nối của Socket.io
io.on('connection', (socketInfo) => {
    console.log(`🔌 Có client mới kết nối: ${socketInfo.id}`);

    // Lắng nghe sự kiện 'join' từ Client (để đưa họ vào Room riêng)
    socketInfo.on('join', (userId) => {
        socketInfo.join(userId);
        console.log(`👤 User [${userId}] đã tham gia room nhận thông báo.`);
    });

    socketInfo.on('disconnect', () => {
        console.log(`🔌 Client đã ngắt kết nối: ${socketInfo.id}`);
    });
});

const startServer = async () => {
    try {
        // 1. Kết nối MongoDB trước
        await mongoose.connect(MONGO_URI);
        console.log('✅ Đã kết nối thành công với MongoDB!');

        // 2. Sau khi DB ok, mới start server
        server.listen(PORT, () => {
            console.log(`🚀 PrimeSound Server đang chạy tại http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Lỗi kết nối cơ sở dữ liệu:', error.message);
        // Thoát process nếu không kết nối được DB
        process.exit(1);
    }
};

startServer();
