const fs = require('fs');
const path = require('path');
const User = require('../models/User.js');
const { UPLOADS_DIR } = require('../config/paths.js');
const { AppError } = require('../utils/AppError.js');

const getCurrentUser = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
};

const updateCurrentUserProfile = async (userId, { name }, file) => {
    const updates = {};

    if (name) {
        updates.name = name;
    }

    if (file) {
        const existing = await User.findById(userId);
        if (!existing) {
            throw new AppError('User not found', 404);
        }

        if (existing.avatar && existing.avatar.startsWith('/uploads/')) {
            const oldAvatarPath = path.join(
                UPLOADS_DIR,
                path.basename(existing.avatar)
            );
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }

        updates.avatar = '/uploads/' + file.filename;
    }

    if (Object.keys(updates).length === 0) {
        return User.findById(userId).select('-password');
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true
    }).select('-password');

    return user;
};

const changePassword = async (userId, oldPassword, newPassword) => {
    if (!oldPassword || !newPassword) {
        throw new AppError('Please provide old and new password', 400);
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
        throw new AppError('Current password is incorrect', 400);
    }

    user.password = await User.hashPassword(newPassword);
    await user.save();

    return { message: 'Password updated successfully' };
};

// --- Admin / danh sách ---

const listUsers = async () => {
    const users = await User.find().select('-password');
    return { count: users.length, users };
};



const updateUserById = async (id, { name, email, role }) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    const safe = await User.findById(id).select('-password');
    return { message: 'User updated', user: safe };
};

const deleteUserById = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    await User.findByIdAndDelete(id);
    return { message: 'User deleted' };
};
const getUserById = async (id) => {
  // Tìm user và loại bỏ password khỏi kết quả trả về
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

module.exports = {
    getCurrentUser,
    updateCurrentUserProfile,
    changePassword,
    listUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    getUserById
};
