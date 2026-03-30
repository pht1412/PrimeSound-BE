const express = require('express');
const router = express.Router();

const { auth } = require('../middlewares/auth.js');
const followController = require('../controllers/follow.controller.js');

// Follow/Unfollow (yêu cầu đăng nhập)
router.post('/:userId', auth, followController.follow);
router.delete('/:userId', auth, followController.unfollow);

// Lấy danh sách followers/following (ai cũng xem được)
router.get('/:userId/followers', followController.getFollowers);
router.get('/:userId/following', followController.getFollowing);

// Kiểm tra trạng thái follow (yêu cầu đăng nhập)
router.get('/:userId/status', auth, followController.getFollowStatus);

module.exports = router;
