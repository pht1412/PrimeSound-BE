const mongoose = require('mongoose');

const repostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  repostedItem: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'repostedItemType',
  },
  repostedItemType: {
    type: String,
    required: true,
    enum: ['Song', 'Playlist'],
  },
  originalItemOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

repostSchema.index({ user: 1, repostedItem: 1 }, { unique: true });

module.exports = mongoose.model('Repost', repostSchema);
