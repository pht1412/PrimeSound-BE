const historyService = require('../services/history.service');

// 1. Thêm vào lịch sử nghe (Khi ấn play bài hát)
exports.addToHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { songId } = req.params;

        await historyService.addToHistory(userId, songId);
        res.status(201).json({ message: "Đã thêm vào lịch sử nghe" });
    } catch (error) {
        const status = error.message.includes("không tồn tại") ? 404 : 400;
        res.status(status).json({ message: error.message });
    }
};

// 2. Lấy danh sách 20 bài nghe gần nhất
exports.getMyHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const history = await historyService.getMyHistory(userId);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Xóa toàn bộ lịch sử nghe
exports.clearMyHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const deletedCount = await historyService.clearMyHistory(userId);
        res.status(200).json({ 
            message: "Đã xóa toàn bộ lịch sử nghe",
            deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
