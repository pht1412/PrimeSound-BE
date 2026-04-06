const express = require('express');
const router = express.Router();
const songController = require('../controllers/song.controller');
const commentController = require('../controllers/comment.controller');
const repostController = require('../controllers/repost.controller');
const { auth, optionalAuth, requireAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/multer.middleware');
const streamSongMiddleware = require('../middlewares/streamSong.middleware');

// Public routes (có thể có optionalAuth để xem bài chưa duyệt nếu là uploader)
router.get('/latest', songController.getLatestSongs);
router.get('/trending', songController.getTrendingSongs);
router.get('/discovery', songController.getDiscoverySongs);
router.get('/', songController.getAllSongs);
router.get('/user/:userId', songController.getSongsByUserId);
// Cần đăng nhập để upload, xem bài của mình
router.post(
    '/',
    auth,
    upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
    songController.uploadSong
);

router.get('/my-songs', auth, songController.getMySongs);

// Admin routes
router.get('/admin/list', auth, requireAdmin, songController.getSongsByStatus);
router.patch('/admin/:id/status', auth, requireAdmin, songController.updateSongStatus);

// Chi tiết, stream, play-count - dùng optionalAuth (user có thể null)
router.get('/:id/stream', optionalAuth, streamSongMiddleware);
router.get('/:id', optionalAuth, songController.getSongDetails);
router.post('/:id/play-count', songController.incrementPlayCount);

module.exports = router;
