const path = require('path');
const fs = require('fs');
const { parseFile } = require('music-metadata');
const Song = require('../models/song.model');
const Artist = require('../models/artist.model');

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
<<<<<<< HEAD
        audioUrl: `/uploads/${audioFile.filename}`,
        coverUrl: coverFile ? `/uploads/${coverFile.filename}` : '',
=======
        audioUrl: audioFile.path,
        coverUrl: coverFile.path,
        duration: duration, // Lưu thời lượng đã tính
<<<<<<< HEAD
>>>>>>> 0e6b5b8 (feat(favorite): implement like/unlike APIs and setup CI pipeline)
=======
>>>>>>> 7d7c2a4ba4d84aa870bd5df036a4019d9ff0a30a
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

    return path.resolve(song.audioUrl);
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