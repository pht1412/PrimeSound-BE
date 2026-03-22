const express = require('express');
const router = express.Router();
const songController = require('../controllers/song.controller');
const { dummyAuthUser, dummyAuthAdmin } = require('../middlewares/auth.middlewares');
const upload = require('../middlewares/multer.middleware');

router.get('/latest', songController.getLatestSongs);
router.get('/trending', songController.getTrendingSongs);
router.get('/discovery', songController.getDiscoverySongs);

router.post(
    '/',
    dummyAuthUser,
    upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
    songController.uploadSong
);
router.get('/my-songs', dummyAuthUser, songController.getMySongs);

router.get('/admin/list', dummyAuthAdmin, songController.getSongsByStatus);
router.patch('/admin/:id/status', dummyAuthAdmin, songController.updateSongStatus);

router.get('/:id/stream', songController.streamSong);
router.get('/:id', songController.getSongDetails);
router.post('/:id/play-count', songController.incrementPlayCount);

module.exports = router;