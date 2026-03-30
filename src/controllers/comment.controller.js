const commentService = require('../services/comment.service');

exports.getSongComments = async (req, res) => {
  try {
    const comments = await commentService.getSongComments(req.params.id, req.user?._id || null);
    res.status(200).json(comments);
  } catch (error) {
    const status = error.message === 'Song not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const comment = await commentService.createComment(req.params.id, req.user._id, req.body.content);
    res.status(201).json(comment);
  } catch (error) {
    const status =
      error.message === 'Song not found' ? 404 :
      error.message === 'Comment content is required' ? 400 :
      500;
    res.status(status).json({ message: error.message });
  }
};

exports.toggleCommentLike = async (req, res) => {
  try {
    const comment = await commentService.toggleCommentLike(req.params.id, req.params.commentId, req.user._id);
    res.status(200).json(comment);
  } catch (error) {
    const status =
      error.message === 'Song not found' ? 404 :
      error.message === 'Comment not found' ? 404 :
      500;
    res.status(status).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const result = await commentService.deleteComment(req.params.id, req.params.commentId, req.user._id);
    res.status(200).json(result);
  } catch (error) {
    const status =
      error.message === 'Song not found' ? 404 :
      error.message === 'Comment not found' ? 404 :
      error.message === 'Forbidden to delete this comment' ? 403 :
      500;
    res.status(status).json({ message: error.message });
  }
};
