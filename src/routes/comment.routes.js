const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { auth } = require('../middlewares/auth');

// Lưu ý: Router này sẽ được gắn vào đường dẫn gốc là /api/v1/songs trong app.js

// 1. Lấy danh sách bình luận của bài hát (Ai cũng xem được, không cần auth)
router.get('/:id/comments', commentController.getSongComments);

// 2. Viết bình luận mới (Yêu cầu đăng nhập)
router.post('/:id/comments', auth, commentController.createComment);

// 3. Thả tim / Hủy thả tim bình luận (Yêu cầu đăng nhập)
router.patch('/:id/comments/:commentId/like', auth, commentController.toggleCommentLike);

// 4. Xóa bình luận (Yêu cầu đăng nhập, service đã xử lý logic check chính chủ)
router.delete('/:id/comments/:commentId', auth, commentController.deleteComment);

module.exports = router;