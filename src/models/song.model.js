const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    genre: {
        type: String
    },
    audioUrl: {
        type: String,
        required: true
    },
    coverUrl: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        default: 0
    },
    playCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectReason: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);