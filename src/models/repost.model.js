const mongoose = require('mongoose');

const repostSchema = new mongoose.Schema(
  {
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 280,
      default: '',
    },
  },
  { timestamps: true }
);

repostSchema.index({ song: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Repost', repostSchema);
