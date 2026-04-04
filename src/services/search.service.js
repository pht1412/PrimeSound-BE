const Song = require('../models/song.model');
const User = require('../models/User'); // BẮT BUỘC IMPORT USER

const searchAll = async (keyword, page = 1, limit = 20) => {
  const searchRegex = new RegExp(keyword, 'i');
  
  // Công thức phân trang: Bỏ qua (page - 1) * limit kết quả ban đầu
  const skip = (page - 1) * limit;

  // Bước 1: Tìm "Nghệ sĩ" (Thực chất là tìm trong bảng User)
  const matchedUsers = await User.find({ 
    name: { $regex: searchRegex },
  })
  .select('_id name avatar');

  const matchedUserIds = matchedUsers.map(user => user._id);

  // Bước 2: Tìm bài hát VÀ đếm tổng số lượng
  const songQuery = {
    $or: [
      { title: { $regex: searchRegex } }, 
      // Tìm bài hát do các User vừa tìm được ở trên đăng tải
      ...(matchedUserIds.length > 0 ? [{ uploadedBy: { $in: matchedUserIds } }] : [])
    ],
    status: 'approved'
  };

  const [songs, totalSongs] = await Promise.all([
    Song.find(songQuery)
      .populate('uploadedBy', 'name avatar') // BẮT BUỘC ĐỂ HIỂN THỊ ẢNH VÀ CHUYỂN TRANG
      .populate('artist', 'name avatarUrl')
      .select('_id title audioUrl coverUrl duration artist uploadedBy playCount createdAt')
      .skip(skip)   // Bỏ qua các bản ghi của trang trước
      .limit(limit), // Giới hạn số lượng của trang hiện tại
    Song.countDocuments(songQuery) // Đếm xem tổng cộng có bao nhiêu bài thỏa mãn
  ]);

  // Trả về kết quả kèm cục Metadata phân trang
  return { 
    success: true, // Bổ sung để khớp với if (response.success) ở Frontend
    data: {
      songs: songs, 
      artists: matchedUsers // Đổi matchedArtists thành matchedUsers
    },
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalSongs / limit),
      totalItems: totalSongs,
      itemsPerPage: Number(limit)
    }
  };
};

module.exports = { searchAll };