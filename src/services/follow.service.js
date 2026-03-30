const User = require('../models/User.js');
const { AppError } = require('../utils/AppError.js');

const hasFollowing = (user, targetId) =>
    (user.following || []).some((id) => id.toString() === targetId.toString());

const followUser = async (currentUserId, targetUserId) => {
    if (currentUserId.toString() === targetUserId.toString()) {
        throw new AppError('Bạn không thể tự theo dõi chính mình', 400);
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        throw new AppError('Người dùng không tồn tại', 404);
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
        throw new AppError('Người dùng không tồn tại', 404);
    }

    if (hasFollowing(currentUser, targetUserId)) {
        throw new AppError('Bạn đã theo dõi người này rồi', 400);
    }

    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followers) targetUser.followers = [];

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await Promise.all([currentUser.save(), targetUser.save()]);

    return { message: 'Theo dõi thành công' };
};

const unfollowUser = async (currentUserId, targetUserId) => {
    if (currentUserId.toString() === targetUserId.toString()) {
        throw new AppError('Bạn không thể hủy theo dõi chính mình', 400);
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        throw new AppError('Người dùng không tồn tại', 404);
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
        throw new AppError('Người dùng không tồn tại', 404);
    }

    if (!hasFollowing(currentUser, targetUserId)) {
        throw new AppError('Bạn chưa theo dõi người này', 400);
    }

    currentUser.following = (currentUser.following || []).filter(
        id => id.toString() !== targetUserId.toString()
    );
    targetUser.followers = (targetUser.followers || []).filter(
        id => id.toString() !== currentUserId.toString()
    );

    await Promise.all([currentUser.save(), targetUser.save()]);

    return { message: 'Hủy theo dõi thành công' };
};

const getFollowers = async (userId, page = 1, limit = 20) => {
    const user = await User.findById(userId).populate('followers', 'name email avatar');
    if (!user) {
        throw new AppError('Người dùng không tồn tại', 404);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const list = user.followers || [];
    const followers = list.slice(startIndex, endIndex);
    const total = list.length;

    return {
        count: total,
        page,
        totalPages: Math.ceil(total / limit),
        followers
    };
};

const getFollowing = async (userId, page = 1, limit = 20) => {
    const user = await User.findById(userId).populate('following', 'name email avatar');
    if (!user) {
        throw new AppError('Người dùng không tồn tại', 404);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const list = user.following || [];
    const following = list.slice(startIndex, endIndex);
    const total = list.length;

    return {
        count: total,
        page,
        totalPages: Math.ceil(total / limit),
        following
    };
};

const getFollowStatus = async (currentUserId, targetUserId) => {
    if (!currentUserId) {
        return { isFollowing: false };
    }
    
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
        return { isFollowing: false };
    }
    
    const isFollowing = hasFollowing(currentUser, targetUserId);
    
    return { isFollowing };
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFollowStatus
};
