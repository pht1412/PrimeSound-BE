const fs = require('fs');
const songService = require('../services/song.service');

exports.uploadSong = async (req, res) => {
    try {
        if (!req.files || !req.files['audio'] || !req.files['cover']) {
            return res.status(400).json({ message: "Audio file and cover image are required" });
        }
        
        const newSong = await songService.createSong(
            req.body, 
            req.user._id, 
            req.files['audio'][0], // Nhớ có [0] vì nó là mảng
            req.files['cover'][0]  // Nhớ có [0]
        );

        res.status(201).json(newSong);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMySongs = async (req, res) => {
    try {
        const songs = await songService.getSongsByUser(req.user._id);
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSongsByStatus = async (req, res) => {
    try {
        const songs = await songService.getSongsByStatusAdmin(req.query.status);
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSongStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        const updatedSong = await songService.updateSongStatusAdmin(id, status, reason);
        res.status(200).json({ message: "Song status updated successfully", song: updatedSong });
    } catch (error) {
        if (error.message === "Invalid status value") {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === "Song not found") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

exports.streamSong = async (req, res) => {
    try {
        const audioPath = await songService.getSongStreamData(req.params.id, req.user);
        
        const stat = fs.statSync(audioPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(audioPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'audio/mpeg',
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'audio/mpeg',
            };
            res.writeHead(200, head);
            fs.createReadStream(audioPath).pipe(res);
        }
    } catch (error) {
        const status = (error.message === "Song not found") ? 404 : 
                       (error.message === "Unauthorized to stream this song") ? 403 : 500;
        res.status(status).json({ message: error.message });
    }
};

exports.getSongDetails = async (req, res) => {
    try {
        const song = await songService.getSongDetails(req.params.id, req.user);
        res.status(200).json(song);
    } catch (error) {
        const status = (error.message === "Song not found") ? 404 : 
                       (error.message === "Unauthorized to view this song") ? 403 : 500;
        res.status(status).json({ message: error.message });
    }
};

exports.incrementPlayCount = async (req, res) => {
    try {
        await songService.incrementPlayCount(req.params.id);
        res.status(200).json({ message: "Recorded" });
    } catch (error) {
        const status = (error.message === "Song not found") ? 404 : 
                       (error.message === "Only approved songs can be played") ? 400 : 500;
        res.status(status).json({ message: error.message });
    }
};

exports.getLatestSongs = async (req, res) => {
    try {
        const songs = await songService.getLastestSongsPublic();
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTrendingSongs = async (req, res) => {
    try {
        const songs = await songService.getTrendingSongsPublic();
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDiscoverySongs = async (req, res) => {
    try {
        const songs = await songService.getDiscoverySongsPublic();
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllSongs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await songService.getAllApprovedSongs(page, limit);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Thêm vào cuối file song.controller.js
exports.getSongsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        // Gọi service em đã viết sẵn
        const allSongs = await songService.getSongsByUser(userId);
        
        // Cực kỳ quan trọng: Chỉ hiển thị bài đã duyệt (approved) trên trang cá nhân
        const publicSongs = allSongs.filter(song => song.status === 'approved');
        
        res.status(200).json({ success: true, data: publicSongs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};