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