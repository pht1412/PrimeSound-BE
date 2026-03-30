const Repost = require('../models/repost.model');
const Song = require('../models/song.model');
const Playlist = require('../models/playlist.model');
const AppError = require('../utils/AppError');
const notificationEvents = require('../events/notificationEvents.js');

const createRepost = async ({ userId, itemId, itemType }) => {
  let item;
  let originalItemOwner;

  if (itemType === 'Song') {
    item = await Song.findById(itemId);
    if (item) {
      originalItemOwner = item.uploadedBy;
    }
  } else if (itemType === 'Playlist') {
    item = await Playlist.findById(itemId);
    if (item) {
      originalItemOwner = item.user;
    }
  } else {
    throw new AppError('Bạn chỉ có thể đăng lại bài hát hoặc danh sách phát.', 400);
  }

  if (!item) {
    throw new AppError('Bài hát hoặc danh sách phát không tồn tại.', 404);
  }

  const existingRepost = await Repost.findOne({ user: userId, repostedItem: itemId });
  if (existingRepost) {
    throw new AppError('Bạn đã đăng lại bài hát hoặc danh sách phát này.', 409);
  }

  const repost = await Repost.create({
    user: userId,
    repostedItem: itemId,
    repostedItemType: itemType,
    originalItemOwner,
  });


  // ================= BẮT ĐẦU: TÍCH HỢP THÔNG BÁO =================
  // Chỉ báo thông báo nếu người repost KHÔNG PHẢI là chủ sở hữu gốc (tránh tự báo cho chính mình)
  if (userId.toString() !== originalItemOwner.toString()) {
    try {
      notificationEvents.emit('create_notification', {
        recipientId: originalItemOwner, // Gửi cho chủ bài hát / chủ playlist
        senderId: userId,               // Người vừa bấm repost
        type: 'repost',                 // Loại sự kiện là repost
        entityId: itemId                // ID của bài hát hoặc playlist
      });
    } catch (notifyError) {
      console.error('Lỗi khi phát thông báo repost:', notifyError.message);
    }
  }
  // ================= KẾT THÚC: TÍCH HỢP THÔNG BÁO =================

  return repost;
};

const deleteRepost = async ({ userId, itemId }) => {
  const result = await Repost.findOneAndDelete({ user: userId, repostedItem: itemId });
  if (!result) {
    throw new AppError('.', 404);
  }
};

const getRepostsByUser = async (userId) => {
  const reposts = await Repost.find({ user: userId })
    .populate({
      path: 'repostedItem',
      populate: {
        path: 'artist',
        select: 'name stageName',
      }
    })
    .sort({ createdAt: -1 });

  return reposts;
};

module.exports = {
  createRepost,
  deleteRepost,
  getRepostsByUser,
};
