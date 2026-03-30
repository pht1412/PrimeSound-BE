const path = require('path');
const fs = require('fs');
const { parseFile } = require('music-metadata');
const Song = require('../models/song.model');
const Artist = require('../models/artist.model');
const notificationEvents = require('../events/notificationEvents.js');

const getOrCreateDefaultArtist = async (artistName) => {
    const name = artistName || 'Unknown Artist';
    let artist = await Artist.findOne({ name });
    if (!artist) {
        artist = await Artist.create({ name, avatarUrl: '' });
    }
    return artist._id;
};

// Hàm tính toán thời lượng bài hát từ file âm thanh
const calculateSongDuration = async (audioFilePath) => {
    try {
        if (!fs.existsSync(audioFilePath)) {
            console.warn(`Audio file not found: ${audioFilePath}`);
            return 0;
        }

        const metadata = await parseFile(audioFilePath);
        const duration = metadata.format.duration || 0; // Thời lượng tính bằng giây
        return Math.round(duration); // Làm tròn đến số nguyên
    } catch (error) {
        console.error(`Error calculating duration for ${audioFilePath}:`, error.message);
        return 0;
    }
};

exports.createSong = async (songData, uploadedBy, audioFile, coverFile) => {
    const artistId = await getOrCreateDefaultArtist(songData.artist);
    
    // Tính toán thời lượng bài hát
    const duration = await calculateSongDuration(audioFile.path);

    const newSong = new Song({
        title: songData.title,
        artist: artistId,
        genre: songData.genre || '',
        uploadedBy: uploadedBy,
        audioUrl: `/uploads/${audioFile.filename}`, // Ghi đè url chuẩn cho DB
        coverUrl: coverFile ? `/uploads/${coverFile.filename}` : '',
        duration: duration,
        status: 'pending'
    });

    const saved = await newSong.save();

    return await Song.findById(saved._id)
        .populate('artist', 'name avatarUrl')
        .populate('uploadedBy', 'name');
};

exports.getSongsByUser = async (userId) => {
    return await Song.find({ uploadedBy: userId })
        .populate('artist', 'name avatarUrl')
        .populate('uploadedBy', 'name');
};

exports.getSongsByStatusAdmin = async (status) => {
    let query = {};
    if (status) {
        query.status = status;
    }

    return await Song.find(query)
        .populate('artist', 'name avatarUrl')
        .populate('uploadedBy', 'name');
};

exports.updateSongStatusAdmin = async (songId, status, reason) => {
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        throw new Error('Invalid status value');
    }

    const updateData = { status };
    if (status === 'rejected' && reason) {
        updateData.rejectReason = reason;
    }

    const song = await Song.findByIdAndUpdate(songId, updateData, { new: true })
        .populate('artist', 'name avatarUrl')
        .populate('uploadedBy', 'name');
    if (!song) {
        throw new Error('Song not found');
    }
    // ================= BẮT ĐẦU: LOGIC THÔNG BÁO KHI ADMIN DUYỆT BÀI =================
    // Chỉ kích hoạt thông báo nếu trạng thái mới được chuyển thành 'approved'
    if (status === 'approved') {
        try {
            let followerIds = [];
            const isMockFollowersEnabled = process.env.MOCK_FOLLOWERS === 'true';

            if (isMockFollowersEnabled) {
                // Giả lập ID người theo dõi để test
                const testFollowerId = process.env.TEST_FOLLOWER_ID;
                if (testFollowerId) followerIds.push(testFollowerId);
                console.log(`[Admin Approve] Giả lập gửi thông báo new_upload cho follower: ${testFollowerId}`);
            } else {
                // TODO: Logic thật lấy danh sách follower sau này
            }

            // Lấy ID của người đã upload bài hát (vì đã populate nên cần gọi ._id)
            const uploaderId = song.uploadedBy._id;

            // Phát thông báo cho tất cả followers
            followerIds.forEach(followerId => {
                notificationEvents.emit('create_notification', {
                    recipientId: followerId,  
                    senderId: uploaderId,     
                    type: 'new_upload',
                    entityId: song._id       
                });
            });
        } catch (notifyError) {
            console.error('Lỗi khi phát thông báo duyệt bài:', notifyError.message);
        }
    }
    // ================= KẾT THÚC: LOGIC THÔNG BÁO =================

    return song;
};

const checkSongAccess = (song, user) => {
    if (!song) {
        throw new Error('Song not found');
    }

    if (song.status !== 'approved') {
        const isUploader = user && user._id.toString() === song.uploadedBy.toString();
        const isAdmin = user && user.role === 'admin';
        if (!isUploader && !isAdmin) {
            throw new Error('Unauthorized to view this song');
        }
    }

    return true;
};

exports.getSongDetails = async (songId, user) => {
    const song = await Song.findById(songId)
        .populate('artist', 'name avatarUrl')
        .populate('uploadedBy', 'name');
    checkSongAccess(song, user);

    return song;
};

exports.getSongStreamData = async (songId, user) => {
    const song = await Song.findById(songId);

    try {
        checkSongAccess(song, user);
    } catch (error) {
        throw new Error('Unauthorized to stream this song');
    }

// ================= BẮT ĐẦU SỬA LỖI ĐƯỜNG DẪN =================
    // Dùng path.basename để chỉ trích xuất đúng cái tên file (VD: 'bai-hat.mp3') từ chuỗi URL
    const filename = path.basename(song.audioUrl);
    
    // Nối ghép thủ công tên file với thư mục uploads chuẩn của dự án
    // __dirname hiện tại đang ở thư mục 'services', nên dùng '..' để lùi ra ngoài rồi mới vào 'uploads'
    const audioPath = path.join(__dirname, '..', 'uploads', filename);

    return audioPath;
    // ================= KẾT THÚC SỬA LỖI =================};
};

exports.incrementPlayCount = async (songId) => {
    const song = await Song.findById(songId);
    if (!song) {
        throw new Error("Song not found");
    }

    if (song.status !== 'approved') {
        throw new Error("Only approved songs can be played");
    }

    song.playCount += 1;
    await song.save();

    return true;
};

exports.getLastestSongsPublic = async () => {
    return await Song.find({ status: 'approved' })
        .populate('artist', 'name avatarUrl')
        .populate('uploadedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(10);
};

exports.getAllApprovedSongs = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const [songs, total] = await Promise.all([
        Song.find({ status: 'approved' })
            .populate('artist', 'name avatarUrl')
            .populate('uploadedBy', 'name')
            .select('_id title genre audioUrl coverUrl duration playCount artist uploadedBy createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Song.countDocuments({ status: 'approved' })
    ]);
    return {
        data: songs,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
        }
    };
};

exports.getTrendingSongsPublic = async () => {
    return await Song.find({ status: 'approved' })
        .populate('artist', 'name avatarUrl')
        .populate('uploadedBy', 'name')
        .sort({ playCount: -1 })
        .limit(10);
};

exports.getDiscoverySongsPublic = async () => {
    return await Song.aggregate([
        { $match: { status: 'approved' } },
        { $sample: { size: 10 } },
        { $lookup: { from: 'artists', localField: 'artist', foreignField: '_id', as: 'artist' } },
        { $lookup: { from: 'users', localField: 'uploadedBy', foreignField: '_id', as: 'uploadedBy' } },
        { $unwind: { path: '$artist', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$uploadedBy', preserveNullAndEmptyArrays: true } },
        { $project: { 
            _id: 1,
            title: 1,
            genre: 1,
            audioUrl: 1,
            coverUrl: 1,
            duration: 1,
            playCount: 1,
            status: 1,
            createdAt: 1,
            'artist.name': 1,
            'artist.avatarUrl': 1,
            'uploadedBy.name': 1
        } }
    ]);
};