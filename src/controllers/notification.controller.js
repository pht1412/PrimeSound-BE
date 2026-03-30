const notificationEvents = require('../events/notificationEvents.js');
const Notification = require('../models/notification.model.js');

const simulateNotification = async (req, res) => {
    try {
        // 1. Kiểm tra cờ bật/tắt từ biến môi trường
        const isMockEnabled = process.env.MOCK_NOTIFICATION === 'true';
        
        if (!isMockEnabled) {
            return res.status(403).json({
                success: false,
                message: 'API giả lập thông báo đang bị khóa (MOCK_NOTIFICATION=false).'
            });
        }

        // 2. Lấy dữ liệu từ body của Postman
        const { recipientId, senderId, type, entityId } = req.body;

        if (!recipientId || !senderId || !type || !entityId) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đủ: recipientId, senderId, type, entityId.'
            });
        }

        // 3. Bắn sự kiện vào Event Bus để xử lý ngầm
        notificationEvents.emit('create_notification', {
            recipientId,
            senderId,
            type,
            entityId
        });

        // 4. Trả về phản hồi ngay lập tức cho Client/Postman
        res.status(200).json({
            success: true,
            message: `Đã phát sự kiện giả lập thông báo loại '${type}' thành công!`
        });

    } catch (error) {
        console.error('Lỗi khi giả lập thông báo:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 1. API Lấy danh sách thông báo (Có phân trang)
const getNotifications = async (req, res) => {
    try {
        // Lấy userId từ token (nếu đã có middleware xác thực) 
        // Hoặc lấy tạm từ query để dễ test trên Postman khi chưa ghép Auth
        const userId = req.user ? req.user.id : req.query.userId; 

        if (!userId) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin user ID.' });
        }

        // Thiết lập phân trang
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Truy vấn DB
        const notifications = await Notification.find({ recipientId: userId })
            .sort({ createdAt: -1 }) // Mới nhất lên đầu
            .skip(skip)
            .limit(limit)
            // Populate để lấy thêm thông tin người gửi (ví dụ: lấy username và avatar)
            .populate('senderId', 'username avatar'); 

        // Đếm tổng số thông báo chưa đọc
        const unreadCount = await Notification.countDocuments({ 
            recipientId: userId, 
            isRead: false 
        });

        // Đếm tổng số thông báo để Front-end làm phân trang
        const total = await Notification.countDocuments({ recipientId: userId });

        res.status(200).json({
            success: true,
            data: notifications,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                unreadCount
            }
        });

    } catch (error) {
        console.error('Lỗi khi lấy thông báo:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông báo.' });
    }
};

// 2. API Đánh dấu một thông báo là đã đọc
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedNotification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true } // Trả về document sau khi đã update
        );

        if (!updatedNotification) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo.' });
        }

        res.status(200).json({
            success: true,
            message: 'Đã đánh dấu đọc thông báo.',
            data: updatedNotification
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đọc:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật trạng thái.' });
    }
};

module.exports = {
    simulateNotification,
    getNotifications,
    markAsRead
};