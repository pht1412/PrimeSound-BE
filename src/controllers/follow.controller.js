const followService = require('../services/follow.service.js');
const { asyncHandler } = require('../utils/asyncHandler.js');

const follow = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;
    
    const result = await followService.followUser(currentUserId, targetUserId);
    res.status(200).json(result);
});

const unfollow = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;
    
    const result = await followService.unfollowUser(currentUserId, targetUserId);
    res.status(200).json(result);
});

const getFollowers = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await followService.getFollowers(userId, page, limit);
    res.status(200).json(result);
});

const getFollowing = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await followService.getFollowing(userId, page, limit);
    res.status(200).json(result);
});

const getFollowStatus = asyncHandler(async (req, res) => {
    const currentUserId = req.user?._id;
    const targetUserId = req.params.userId;
    
    const result = await followService.getFollowStatus(currentUserId, targetUserId);
    res.status(200).json(result);
});

module.exports = {
    follow,
    unfollow,
    getFollowers,
    getFollowing,
    getFollowStatus
};
