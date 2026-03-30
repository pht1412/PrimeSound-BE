const Favorite = require('../models/favorite.model');
const Song = require('../models/song.model');

// 1. Thả tim (Like)
exports.likeSong = async (userId, songId) => {
    const songExists = await Song.findById(songId);
    if (!songExists) throw new Error("Song not found");

    try {
        const newLike = await Favorite.create({ user: userId, song: songId });
        return newLike;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error("You have already liked this song");
        }
        throw error;
    }
};

// 2. Bỏ thả tim (Unlike)
exports.unlikeSong = async (userId, songId) => {
    const deletedLike = await Favorite.findOneAndDelete({ user: userId, song: songId });
    if (!deletedLike) throw new Error("You have not liked this song");
    return true;
};

// 3. Lấy danh sách bài hát đã Like của 1 User
exports.getLikedSongs = async (userId) => {
    const favorites = await Favorite.find({ user: userId })
        .populate({
            path: 'song',
            populate: [
                {
                    path: 'uploadedBy',
                    select: 'name'
                },
                {
                    path: 'artist',
                    select: 'name avatarUrl'
                }
            ]
        })
        .sort({ createdAt: -1 });

    return favorites.map(fav => fav.song);
};