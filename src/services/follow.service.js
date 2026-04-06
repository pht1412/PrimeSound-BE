const mongoose = require('mongoose');
const User = require('../models/User.js');
const { AppError } = require('../utils/AppError.js');
const notificationEvents = require('../events/notificationEvents.js');

const hasFollowing = (user, targetId) =>
    (user.following || []).some((id) => id.toString() === targetId.toString());

// ==========================================
// 1. HÀM FOLLOW BẰNG TRANSACTION
// ==========================================
const followUser = async (currentUserId, targetUserId) => {
    if (currentUserId.toString() === targetUserId.toString()) {
        throw new AppError('Bạn không thể tự theo dõi chính mình', 400);
    }

    // Khởi tạo Session cho Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Lấy thông tin user trong phạm vi của session hiện tại
        const targetUser = await User.findById(targetUserId).session(session);
        if (!targetUser) throw new AppError('Người dùng không tồn tại', 404);

        const currentUser = await User.findById(currentUserId).session(session);
        if (!currentUser) throw new AppError('Người dùng không tồn tại', 404);

        if (hasFollowing(currentUser, targetUserId)) {
            throw new AppError('Bạn đã theo dõi người này rồi', 400);
        }

        // Dùng $addToSet: Chỉ thêm vào mảng nếu chưa tồn tại (chống trùng lặp & Race Condition)
        // Lưu ý: Phải truyền { session } vào options của hàm update
        // 1. Cập nhật cho Fan bằng findByIdAndUpdate
        const updatedFan = await User.findByIdAndUpdate(
            currentUserId,
            { $addToSet: { following: targetUserId } },
            { session, new: true } // new: true để trả về data SAU KHI update
        );

        // 2. Cập nhật cho Idol bằng findByIdAndUpdate
        const updatedIdol = await User.findByIdAndUpdate(
            targetUserId,
            { $addToSet: { followers: currentUserId } },
            { session, new: true }
        );

        // NẾU MỌI THỨ THÀNH CÔNG -> Xác nhận giao dịch
        await session.commitTransaction();

    } catch (error) {
        // NẾU CÓ LỖI XẢY RA -> Hoàn tác mọi thay đổi trong DB
        await session.abortTransaction();
        throw error; // Ném lỗi ra ngoài cho Controller xử lý
    } finally {
        // Luôn luôn đóng session để giải phóng tài nguyên
        session.endSession();
    }

    // ================= BẮT ĐẦU TÍCH HỢP THÔNG BÁO =================
    // Chạy ngoài transaction vì socket không cần rollback database
    try {
        notificationEvents.emit('create_notification', {
            recipientId: targetUserId,
            senderId: currentUserId,
            type: 'follow',
            entityId: currentUserId
        });
    } catch (notifyError) {
        console.error('Lỗi khi phát thông báo follow:', notifyError.message);
    }
    // ================= KẾT THÚC TÍCH HỢP THÔNG BÁO =================

    return { message: 'Theo dõi thành công' };
};

// ==========================================
// 2. HÀM UNFOLLOW BẰNG TRANSACTION
// ==========================================
const unfollowUser = async (currentUserId, targetUserId) => {
    if (currentUserId.toString() === targetUserId.toString()) {
        throw new AppError('Bạn không thể hủy theo dõi chính mình', 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const targetUser = await User.findById(targetUserId).session(session);
        if (!targetUser) throw new AppError('Người dùng không tồn tại', 404);

        const currentUser = await User.findById(currentUserId).session(session);
        if (!currentUser) throw new AppError('Người dùng không tồn tại', 404);

        if (!hasFollowing(currentUser, targetUserId)) {
            throw new AppError('Bạn chưa theo dõi người này', 400);
        }

        // Dùng $pull: Tìm và xóa phần tử khỏi mảng
        await User.updateOne(
            { _id: currentUserId },
            { $pull: { following: targetUserId } },
            { session }
        );

        await User.updateOne(
            { _id: targetUserId },
            { $pull: { followers: currentUserId } },
            { session }
        );

        await session.commitTransaction();

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }

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
