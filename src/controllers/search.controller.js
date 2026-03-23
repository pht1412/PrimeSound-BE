const searchService = require('../services/search.service');

const search = async (req, res) => {
  try {
    const keyword = req.query.keyword || req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!keyword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp từ khóa tìm kiếm (keyword hoặc q)' 
      });
    }

    const results = await searchService.searchAll(keyword, page, limit);

    return res.status(200).json({
      success: true,
      data: results.data,
      pagination: results.pagination
    });
  } catch (error) {
    console.error('Lỗi API Search:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { search };