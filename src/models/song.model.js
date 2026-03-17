const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' }, // Có thể null nếu là đĩa đơn (single)
  title: { type: String, required: true },
  audioUrl: { type: String, required: true },
  coverUrl: { type: String, default: '' },
  duration: { type: Number, required: true }, // Tính bằng giây
  playCount: { type: Number, default: 0 },
  moderationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);