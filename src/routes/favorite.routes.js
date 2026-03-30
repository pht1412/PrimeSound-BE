const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { auth } = require('../middlewares/auth');

router.get('/my-liked', auth, favoriteController.getMyLikedSongs);
router.post('/:songId', auth, favoriteController.likeSong);
router.delete('/:songId', auth, favoriteController.unlikeSong);

module.exports = router;