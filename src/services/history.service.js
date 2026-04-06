const History = require('../models/history.model');
const Song = require('../models/song.model');

// 1. Thêm vào lịch sử nghe (Khi ấn play bài hát)
exports.addToHistory = async (userId, songId) => {
    const songExists = await Song.findById(songId);
    if (!songExists) throw new Error("Bài hát không tồn tại");

    const newHistory = await History.create({
        userId,
        songId,
        listenedAt: new Date()
    });

    return newHistory;
};

// 2. Lấy danh sách 20 bài nghe gần nhất
exports.getMyHistory = async (userId) => {
    const histories = await History.find({ userId })
        .populate({
            path: 'songId',
            populate: [
                {
                    path: 'uploadedBy',
                    select: 'name avatar'
                },
                {
                    path: 'artist',
                    select: 'name avatarUrl'
                }
            ]
        })
        .sort({ listenedAt: -1 })
        .limit(20);

    // Filter out những bài hát đã bị xóa
    return histories
        .filter(h => h.songId !== null)
        .map(h => ({
            _id: h.songId._id,
            title: h.songId.title,
            audioUrl: h.songId.audioUrl,
            coverImage: h.songId.coverUrl,
            duration: h.songId.duration,
            uploadedBy: h.songId.uploadedBy,
            artist: h.songId.artist,
            listenedAt: h.listenedAt
        }));
};

// 3. Xóa toàn bộ lịch sử nghe của user
exports.clearMyHistory = async (userId) => {
    const result = await History.deleteMany({ userId });
    return result.deletedCount;
};
