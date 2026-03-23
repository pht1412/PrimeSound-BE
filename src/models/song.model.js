const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
{
    // người upload
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // nghệ sĩ (chuẩn hóa quan hệ)
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
        required: true
    },

    // album (optional)
    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
        default: null
    },

    // thông tin bài hát
    title: {
        type: String,
        required: true,
        trim: true
    },

    genre: {
        type: String,
        default: ''
    },

    audioUrl: {
        type: String,
        required: true
    },

    coverUrl: {
        type: String,
        default: ''
    },

    duration: {
        type: Number,
        default: 0 // giây
    },

    playCount: {
        type: Number,
        default: 0
    },

    // moderation (kết hợp 2 nhánh)
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    rejectReason: {
        type: String,
        default: ''
    }
},
{ timestamps: true }
);

module.exports = mongoose.model('Song', songSchema);