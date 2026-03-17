const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlist.controller');
const { mockAuth } = require('../middlewares/auth.middleware');

// Gắn mockAuth vào tất cả các route của playlist để bắt buộc "đăng nhập"
router.use(mockAuth);

router.post('/', playlistController.create);
router.patch('/:id', playlistController.update);
router.delete('/:id', playlistController.remove);

router.get('/', playlistController.getAll);
router.get('/:id', playlistController.getOne);

router.post('/:id/songs', playlistController.addSong);
router.delete('/:id/songs/:songId', playlistController.removeSong);

router.patch('/:id/songs/reorder', playlistController.reorder);

module.exports = router;