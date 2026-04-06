const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    songId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
        required: true
    },
    listenedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index để query nhanh hơn
historySchema.index({ userId: 1, listenedAt: -1 });

const History = mongoose.model('History', historySchema);

module.exports = History;
