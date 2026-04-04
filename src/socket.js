// src/socket.js
let io;

module.exports = {
    init: (httpServer) => {
        const { Server } = require('socket.io');
        io = new Server(httpServer, {
            cors: {
                origin: "*", // Tạm thời mở CORS cho mọi nguồn để dễ test
                methods: ["GET", "POST", "PATCH"]
            }
        });
        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error('Socket.io chưa được khởi tạo!');
        }
        return io;
    }
};