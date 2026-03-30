const EventEmitter = require('events');
const Notification = require('../models/notification.model.js');
const socket = require('../socket.js'); // Thêm dòng này

class NotificationEmitter extends EventEmitter {}
const notificationEvents = new NotificationEmitter();

notificationEvents.on('create_notification', async (data) => {
    try {
        const { recipientId, senderId, type, entityId } = data;

        if (recipientId.toString() === senderId.toString()) {
            return; 
        }

        const newNotification = new Notification({
            recipientId,
            senderId,
            type,
            entityId
        });

        await newNotification.save();
        console.log(`[Event Bus] ✅ Đã lưu thông báo '${type}' cho user ${recipientId}`);

        // ================= THÊM LOGIC SOCKET.IO TẠI ĐÂY =================
        try {
            const io = socket.getIo();
            // Phát sự kiện 'new_notification' thẳng vào Room có tên là recipientId
            io.to(recipientId.toString()).emit('new_notification', newNotification);
            console.log(`[Socket.io] 🚀 Đã bắn thông báo real-time tới room [${recipientId}]`);
        } catch (socketError) {
            console.error('[Socket.io] ⚠️ Lỗi khi gửi real-time:', socketError.message);
        }
        // ==================================================================

    } catch (error) {
        console.error('[Event Bus] ❌ Lỗi khi lưu thông báo:', error.message);
    }
});

module.exports = notificationEvents;