const Song = require('../models/song.model');
const Artist = require('../models/artist.model');

const searchAll = async (keyword, page, limit) => {
  const searchRegex = new RegExp(keyword, 'i');
  
  // Công thức phân trang: Bỏ qua (page - 1) * limit kết quả ban đầu
  const skip = (page - 1) * limit;

  // Bước 1: Tìm Nghệ sĩ
  const matchedArtists = await Artist.find({ 
    name: { $regex: searchRegex } 
  })
  .select('_id name avatarUrl');
  // .limit() và .skip() cho Artist nếu cần, nhưng thường artist ít nên có thể giữ nguyên hoặc limit nhỏ

  const matchedArtistIds = matchedArtists.map(artist => artist._id);

  // Bước 2: Tìm bài hát VÀ đếm tổng số lượng (để Frontend biết đường làm nút "Next")
  const songQuery = {
    $or: [
      { title: { $regex: searchRegex } }, 
      { artist: { $in: matchedArtistIds } } 
    ],
    moderationStatus: 'approved' 
  };

  const [songs, totalSongs] = await Promise.all([
    Song.find(songQuery)
      .populate('artist', 'name avatarUrl')
      .select('_id title audioUrl coverUrl duration artist')
      .skip(skip)   // Bỏ qua các bản ghi của trang trước
      .limit(limit), // Giới hạn số lượng của trang hiện tại
    Song.countDocuments(songQuery) // Đếm xem tổng cộng có bao nhiêu bài thỏa mãn
  ]);

  // Trả về kết quả kèm cục Metadata phân trang
  return { 
    data: {
      songs: songs, 
      artists: matchedArtists 
    },
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalSongs / limit),
      totalItems: totalSongs,
      itemsPerPage: limit
    }
  };
};

module.exports = { searchAll };