const searchService = require('../services/search.service');

const search = async (req, res) => {
  try {
    const keyword = req.query.q;
    // Lấy page và limit từ query, nếu không có thì mặc định là trang 1, 10 kết quả
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!keyword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp từ khóa tìm kiếm (q)' 
      });
    }

    const results = await searchService.searchAll(keyword, page, limit);

    return res.status(200).json({
      success: true,
      data: results.data,
      pagination: results.pagination // Trả về thông tin phân trang cho Frontend
    });
  } catch (error) {
    console.error('Lỗi API Search:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { search };