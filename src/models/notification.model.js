const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like_song', 'comment', 'follow', 'repost', 'new_upload'],
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // Chú thích: ID này linh hoạt, có thể là ID của Song, Comment, hoặc User tùy vào 'type'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Đánh Index kết hợp (Compound Index) để tối ưu hóa tốc độ truy vấn 
// khi user có hàng ngàn thông báo và cần sort theo thời gian mới nhất.
notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);