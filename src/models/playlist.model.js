const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' }, // Thêm trường mô tả
  songs: [{
    song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
    addedAt: { type: Date, default: Date.now }
  }],
  isDeleted: { type: Boolean, default: false } // Cờ đánh dấu Xóa mềm
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);