const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');
const { auth } = require('../middlewares/auth');

// Tất cả routes đều cần auth - userId được lấy từ token
// Authorization: User chỉ có thể xem/xóa lịch sử của chính mình (userId từ auth middleware)

// POST /api/v1/history/:songId - Thêm vào lịch sử nghe (khi ấn play)
router.post('/:songId', auth, historyController.addToHistory);

// GET /api/v1/history - Lấy 20 bài nghe gần nhất
router.get('/', auth, historyController.getMyHistory);

// DELETE /api/v1/history - Xóa toàn bộ lịch sử nghe
router.delete('/', auth, historyController.clearMyHistory);

module.exports = router;
