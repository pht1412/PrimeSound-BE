const express = require('express');
const { 
    simulateNotification, 
    getNotifications, 
    markAsRead 
} = require('../controllers/notification.controller.js');

const router = express.Router();

// Route test giả lập (Đã làm ở Giai đoạn 2)
router.post('/simulate', simulateNotification);

// Lấy danh sách thông báo
router.get('/', getNotifications);

// Cập nhật trạng thái đã đọc cho 1 thông báo
router.patch('/:id/read', markAsRead);

module.exports = router;