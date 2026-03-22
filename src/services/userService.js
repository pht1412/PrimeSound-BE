import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import { UPLOADS_DIR } from '../config/paths.js';
import { AppError } from '../utils/AppError.js';

export const getCurrentUser = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
};

export const updateCurrentUserProfile = async (userId, { name }, file) => {
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

export const changePassword = async (userId, oldPassword, newPassword) => {
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

export const listUsers = async () => {
    const users = await User.find().select('-password');
    return { count: users.length, users };
};

export const getUserById = async (id) => {
    const user = await User.findById(id).select('-password');
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
};

export const updateUserById = async (id, { name, email, role }) => {
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

export const deleteUserById = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    await User.findByIdAndDelete(id);
    return { message: 'User deleted' };
};
