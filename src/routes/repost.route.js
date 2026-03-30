const express = require('express');
const router = express.Router();
const repostController = require('../controllers/repost.controller');
const { auth } = require('../middlewares/auth');

router.post('/', auth, repostController.repostItem);
router.delete('/:itemId', auth, repostController.unrepostItem);
router.get('/user/:userId', repostController.getUserReposts);

module.exports = router;
