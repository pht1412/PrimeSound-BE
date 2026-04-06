const followService = require('../services/follow.service.js');
const { asyncHandler } = require('../utils/asyncHandler.js');

const follow = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user.id || req.user._id; 
    const targetUserId = req.params.userId;
    
    console.log("👉 Người đi follow (Current):", currentUserId);
    console.log("👉 Người được follow (Target):", targetUserId);
    
    // THÊM DÒNG NÀY ĐỂ KIỂM TRA CHẮC CHẮN MÁY ĐANG NHẬN ATLAS HAY LOCALHOST
    console.log("👉 Đang kết nối DB tới:", process.env.MONGO_URI);
    
    try {
        const result = await followService.followUser(currentUserId, targetUserId);
        res.status(200).json(result);
    } catch (error) {
        // IN ĐỎ LỖI THẬT SỰ RA TERMINAL
        console.error("🔥 LỖI THẬT SỰ LÀ ĐÂY:", error); 
        
        // Ném tiếp lỗi ra ngoài như bình thường
        next(error); 
    }
});

const unfollow = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id || req.user._id;
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
    const currentUserId = req.user?._id || req.user._id;
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
