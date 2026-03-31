const Comment = require('../models/comment.model');
const Song = require('../models/song.model');
const notificationEvents = require('../events/notificationEvents');

const ensureSongExists = async (songId) => {
  const song = await Song.findById(songId).select('_id');
  if (!song) {
    throw new Error('Song not found');
  }
};

const mapComment = (comment, userId = null) => {
  const likedByCurrentUser = userId
    ? comment.likes.some((likeId) => likeId.toString() === userId.toString())
    : false;

  return {
    id: comment._id,
    songId: comment.song,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    likesCount: comment.likes.length,
    isLiked: likedByCurrentUser,
    canDelete: userId ? comment.user?._id?.toString() === userId.toString() : false,
    user: {
      id: comment.user?._id,
      name: comment.user?.name || 'Unknown User',
      avatar: comment.user?.avatar || '',
    },
  };
};

const getSongComments = async (songId, currentUserId = null) => {
  await ensureSongExists(songId);

  const comments = await Comment.find({ song: songId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

  return comments.map((comment) => mapComment(comment, currentUserId));
};

const createComment = async (songId, userId, content) => {
  // 1. SỬA LẠI ĐOẠN NÀY: Lấy thêm trường uploadedBy để biết ai là chủ bài hát
  const song = await Song.findById(songId).select('_id uploadedBy');
  if (!song) {
    throw new Error('Song not found');
  }

  const trimmedContent = content?.trim();
  if (!trimmedContent) {
    throw new Error('Comment content is required');
  }

  // 2. Tạo bình luận
  const comment = await Comment.create({
    song: songId,
    user: userId,
    content: trimmedContent,
  });

  // ================= BẮT ĐẦU TÍCH HỢP THÔNG BÁO =================
  // Nếu bài hát có chủ và người bình luận KHÔNG PHẢI là chủ bài hát
  if (song.uploadedBy && userId.toString() !== song.uploadedBy.toString()) {
    try {
      notificationEvents.emit('create_notification', {
        recipientId: song.uploadedBy, // Gửi cho chủ bài hát
        senderId: userId,             // Người vừa bình luận
        type: 'comment',              // Loại thông báo: comment
        entityId: songId              // Đính kèm ID bài hát để Front-end lấy ảnh bìa
      });
    } catch (notifyError) {
      console.error('Lỗi khi phát thông báo comment:', notifyError.message);
    }
  }
  // ================= KẾT THÚC TÍCH HỢP THÔNG BÁO =================

  const populatedComment = await Comment.findById(comment._id).populate('user', 'name avatar');
  return mapComment(populatedComment, userId);
};

const toggleCommentLike = async (songId, commentId, userId) => {
  await ensureSongExists(songId);

  const comment = await Comment.findOne({ _id: commentId, song: songId }).populate('user', 'name avatar');
  if (!comment) {
    throw new Error('Comment not found');
  }

  const existingLikeIndex = comment.likes.findIndex((likeId) => likeId.toString() === userId.toString());

  if (existingLikeIndex >= 0) {
    comment.likes.splice(existingLikeIndex, 1);
  } else {
    comment.likes.push(userId);
  }

  await comment.save();

  return mapComment(comment, userId);
};

const deleteComment = async (songId, commentId, userId) => {
  await ensureSongExists(songId);

  const comment = await Comment.findOne({ _id: commentId, song: songId }).populate('user', 'name avatar');
  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.user?._id?.toString() !== userId.toString()) {
    throw new Error('Forbidden to delete this comment');
  }

  await Comment.deleteOne({ _id: commentId });

  return { success: true, deletedCommentId: commentId };
};

module.exports = {
  getSongComments,
  createComment,
  toggleCommentLike,
  deleteComment,
};
