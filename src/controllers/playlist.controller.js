const playlistService = require('../services/playlist.service');

const create = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: 'Tên Playlist là bắt buộc' });
    }

    const playlist = await playlistService.createPlaylist(userId, req.body);
    return res.status(201).json({ success: true, data: playlist, message: 'Tạo playlist thành công' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const userId = req.user._id;

    const updatedPlaylist = await playlistService.updatePlaylist(playlistId, userId, req.body);
    return res.status(200).json({ success: true, data: updatedPlaylist, message: 'Cập nhật thành công' });
  } catch (error) {
    return res.status(403).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const userId = req.user._id;

    await playlistService.softDeletePlaylist(playlistId, userId);
    return res.status(200).json({ success: true, message: 'Xóa playlist thành công' });
  } catch (error) {
    return res.status(403).json({ success: false, message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const results = await playlistService.getUserPlaylists(userId, page, limit);
    return res.status(200).json({ success: true, ...results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getOne = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const userId = req.user._id;

    const playlist = await playlistService.getPlaylistById(playlistId, userId);
    return res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const addSong = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const songId = req.body.songId; // Lấy songId từ Body JSON
    const userId = req.user._id;

    if (!songId) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp songId!' });
    }

    await playlistService.addSongToPlaylist(playlistId, songId, userId);
    return res.status(200).json({ success: true, message: 'Đã thêm bài hát vào Playlist' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const removeSong = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const songId = req.params.songId; // Lấy songId trực tiếp từ URL
    const userId = req.user._id;

    await playlistService.removeSongFromPlaylist(playlistId, songId, userId);
    return res.status(200).json({ success: true, message: 'Đã xóa bài hát khỏi Playlist' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
const reorder = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const { songId, newIndex } = req.body; // Front-end sẽ gửi lên body 2 trường này
    const userId = req.user._id;

    if (!songId || newIndex === undefined) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin songId hoặc newIndex' });
    }

    await playlistService.reorderSongs(playlistId, userId, songId, newIndex);
    return res.status(200).json({ success: true, message: 'Đã cập nhật thứ tự bài hát' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};


module.exports = { create, update, remove, getAll, getOne, addSong, removeSong, reorder };