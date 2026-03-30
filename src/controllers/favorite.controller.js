const favoriteService = require('../services/favorite.service');

exports.likeSong = async (req, res) => {
    try {
        const userId = req.user._id;
        const songId = req.params.songId;

        await favoriteService.likeSong(userId, songId);
        res.status(200).json({ message: "Đã thích bài hát" });
    } catch (error) {
        const status = error.message.includes("không tồn tại") ? 404 : 400;
        res.status(status).json({ message: error.message });
    }
};

exports.unlikeSong = async (req, res) => {
    try {
        const userId = req.user._id;
        const songId = req.params.songId;

        await favoriteService.unlikeSong(userId, songId);
        res.status(200).json({ message: "Đã bỏ thích bài hát" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getMyLikedSongs = async (req, res) => {
    try {
        const userId = req.user._id;
        const likedSongs = await favoriteService.getLikedSongs(userId);
        res.status(200).json(likedSongs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};