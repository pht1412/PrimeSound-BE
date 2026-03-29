const Repost = require('../models/repost.model');
const Song = require('../models/song.model');
const Playlist = require('../models/playlist.model');
const AppError = require('../utils/AppError');

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
