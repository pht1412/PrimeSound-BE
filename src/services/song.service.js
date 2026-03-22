const path = require('path');
const Song = require('../models/song.model');

exports.createSong = async (songData, uploadedBy, audioFile, coverFile) => {
    const newSong = new Song({
        title: songData.title,
        artist: songData.artist,
        genre: songData.genre,
        uploadedBy: uploadedBy,
        audioUrl: audioFile.path,
        coverUrl: coverFile.path,
        status: 'pending'
    });

    return await newSong.save();
};

exports.getSongsByUser = async (userId) => {
    return await Song.find({ uploadedBy: userId });
};

exports.getSongsByStatusAdmin = async (status) => {
    let query = {};
    if (status) {
        query.status = status;
    }

    return await Song.find(query);
};

exports.updateSongStatusAdmin = async (songId, status, reason) => {
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        throw new Error('Invalid status value');
    }

    const updateData = { status };
    if (status === 'rejected' && reason) {
        updateData.rejectReason = reason;
    }

    const song = await Song.findByIdAndUpdate(songId, updateData, { new: true });
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
    const song = await Song.findById(songId);
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
    return await Song.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(10);
}

exports.getTrendingSongsPublic = async () => {
    return await Song.find({ status: 'approved' }).sort({ playCount: -1 }).limit(10);
};

exports.getDiscoverySongsPublic = async () => {
    return await Song.aggregate([
        { $match: { status: 'approved' } },
        { $sample: { size: 10 } }
    ]);
};