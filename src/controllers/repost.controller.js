const repostService = require('../services/repost.service');
const { asyncHandler } = require('../utils/asyncHandler');

const repostItem = asyncHandler(async (req, res) => {
  const { itemId, itemType } = req.body;
  const userId = req.user._id;

  const repost = await repostService.createRepost({ userId, itemId, itemType });
  res.status(201).json({
    status: 'success',
    data: {
      repost,
    },
  });
});

const unrepostItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  await repostService.deleteRepost({ userId, itemId });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const getUserReposts = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const reposts = await repostService.getRepostsByUser(userId);
  res.status(200).json({
    status: 'success',
    results: reposts.length,
    data: {
      reposts,
    },
  });
});

module.exports = {
  repostItem,
  unrepostItem,
  getUserReposts,
};
