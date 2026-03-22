const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  title: { type: String, required: true },
  coverUrl: { type: String, default: '' },
  releaseDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Album', albumSchema);