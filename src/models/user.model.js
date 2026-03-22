const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  avatarUrl: { type: String, default: '' },
  accountStatus: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' }
}, { timestamps: true }); // Tự động có createdAt và updatedAt

module.exports = mongoose.model('User', userSchema);