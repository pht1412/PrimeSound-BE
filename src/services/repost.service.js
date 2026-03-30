const Repost = require('../models/repost.model');
const Song = require('../models/song.model');

const ensureSongExists = async (songId) => {
  const song = await Song.findById(songId).select('_id');
  if (!song) {
    throw new Error('Song not found');
  }
};

const mapRepost = (repost, userId = null) => ({
  id: repost._id,
  songId: repost.song,
  note: repost.note || '',
  createdAt: repost.createdAt,
  canDelete: userId ? repost.user?._id?.toString() === userId.toString() : false,
  user: {
    id: repost.user?._id,
    name: repost.user?.name || 'Unknown User',
    avatar: repost.user?.avatar || '',
  },
});

const getSongReposts = async (songId, currentUserId = null) => {
  await ensureSongExists(songId);

  const reposts = await Repost.find({ song: songId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

  return {
    items: reposts.map((repost) => mapRepost(repost, currentUserId)),
    total: reposts.length,
    hasReposted: currentUserId
      ? reposts.some((repost) => repost.user?._id?.toString() === currentUserId.toString())
      : false,
  };
};

const createRepost = async (songId, userId, note = '') => {
  await ensureSongExists(songId);

  const trimmedNote = note.trim();

  const existingRepost = await Repost.findOne({ song: songId, user: userId }).populate('user', 'name avatar');
  if (existingRepost) {
    if (trimmedNote && trimmedNote !== existingRepost.note) {
      existingRepost.note = trimmedNote;
      await existingRepost.save();
    }

    return mapRepost(existingRepost, userId);
  }

  const repost = await Repost.create({
    song: songId,
    user: userId,
    note: trimmedNote,
  });

  const populatedRepost = await Repost.findById(repost._id).populate('user', 'name avatar');
  return mapRepost(populatedRepost, userId);
};

const deleteRepost = async (songId, repostId, userId) => {
  await ensureSongExists(songId);

  const repost = await Repost.findOne({ _id: repostId, song: songId }).populate('user', 'name avatar');
  if (!repost) {
    throw new Error('Repost not found');
  }

  if (repost.user?._id?.toString() !== userId.toString()) {
    throw new Error('Forbidden to delete this repost');
  }

  await Repost.deleteOne({ _id: repostId });

  return { success: true, deletedRepostId: repostId };
};

module.exports = {
  getSongReposts,
  createRepost,
  deleteRepost,
};
