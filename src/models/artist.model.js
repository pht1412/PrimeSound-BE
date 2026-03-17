const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatarUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Artist', artistSchema);