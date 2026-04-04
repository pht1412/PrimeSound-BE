const notificationEvents = require('../events/notificationEvents.js');
const Notification = require('../models/notification.model.js');
const Song = require('../models/song.model.js'); 

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

// 1. API Lấy danh sách thông báo (Có phân trang & Đính kèm thông tin bài hát)
const getNotifications = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : req.query.userId; 

        if (!userId) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin user ID.' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // BƯỚC A: Lấy thông báo và Tên người gửi (Sửa 'username' thành 'name')
        // Dùng .lean() để chuyển data Mongoose thành mảng JSON thuần túy, giúp ta dễ dàng thêm thuộc tính mới
        const notifications = await Notification.find({ recipientId: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('senderId', 'name avatar') 
            .lean(); 

        const unreadCount = await Notification.countDocuments({ 
            recipientId: userId, 
            isRead: false 
        });
        const total = await Notification.countDocuments({ recipientId: userId });

        // BƯỚC B: Tìm thông tin bài hát (Cover, Title) dựa vào entityId
        for (let noti of notifications) {
            // Chỉ tìm bài hát cho các loại thông báo liên quan đến bài hát
            if (['like_song', 'comment', 'new_upload', 'repost'].includes(noti.type)) {
                // entityId lúc này chính là ID của bài hát
                const songInfo = await Song.findById(noti.entityId).select('title coverUrl').lean();
                if (songInfo) {
                    noti.entityDetails = songInfo; // Gắn thêm 1 cục data chứa ảnh và tên bài
                }
            }
        }

        res.status(200).json({
            success: true,
            data: notifications,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit), unreadCount }
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