const repostService = require('../services/repost.service');

exports.getSongReposts = async (req, res) => {
  try {
    const reposts = await repostService.getSongReposts(req.params.id, req.user?._id || null);
    res.status(200).json(reposts);
  } catch (error) {
    const status = error.message === 'Song not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

exports.createRepost = async (req, res) => {
  try {
    const repost = await repostService.createRepost(req.params.id, req.user._id, req.body.note || '');
    res.status(201).json(repost);
  } catch (error) {
    const status = error.message === 'Song not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

exports.deleteRepost = async (req, res) => {
  try {
    const result = await repostService.deleteRepost(req.params.id, req.params.repostId, req.user._id);
    res.status(200).json(result);
  } catch (error) {
    const status =
      error.message === 'Song not found' ? 404 :
      error.message === 'Repost not found' ? 404 :
      error.message === 'Forbidden to delete this repost' ? 403 :
      500;
    res.status(status).json({ message: error.message });
  }
};
