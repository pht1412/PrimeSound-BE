const Playlist = require('../models/playlist.model');
const Song = require('../models/song.model');

// 1. Tạo mới Playlist
const createPlaylist = async (userId, data) => {
  const newPlaylist = await Playlist.create({
    user: userId,
    name: data.name,
    description: data.description || '',
    songs: [] // Khởi tạo mảng rỗng
  });
  return newPlaylist;
};

// 2. Sửa Playlist (Check quyền sở hữu)
const updatePlaylist = async (playlistId, userId, updateData) => {
  // Tìm playlist xem có tồn tại, chưa bị xóa mềm, và thuộc về user này không
  const playlist = await Playlist.findOne({ _id: playlistId, user: userId, isDeleted: false });

  if (!playlist) {
    throw new Error('Playlist không tồn tại hoặc bạn không có quyền sửa!');
  }

  // Cập nhật thông tin
  if (updateData.name) playlist.name = updateData.name;
  if (updateData.description !== undefined) playlist.description = updateData.description;

  await playlist.save();
  return playlist;
};

// 3. Xóa mềm Playlist (Soft Delete)
const softDeletePlaylist = async (playlistId, userId) => {
  const playlist = await Playlist.findOne({ _id: playlistId, user: userId, isDeleted: false });

  if (!playlist) {
    throw new Error('Playlist không tồn tại hoặc bạn không có quyền xóa!');
  }

  // Đổi cờ isDeleted thành true thay vì dùng .deleteOne()
  playlist.isDeleted = true;
  await playlist.save();
  return true;
};
// ... (các hàm create, update, delete giữ nguyên)

// 4. Lấy danh sách TẤT CẢ Playlist của User (Có phân trang)
// 4. Lấy danh sách TẤT CẢ Playlist của User (Có phân trang)
const getUserPlaylists = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const query = { user: userId, isDeleted: false }; 

  const [playlists, total] = await Promise.all([
    Playlist.find(query)
      .select('_id name description createdAt songs')
      .populate('songs.song', 'coverUrl') // BƯỚC QUAN TRỌNG: Populate để lấy ảnh bìa
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit),
    Playlist.countDocuments(query)
  ]);

  const formattedPlaylists = playlists.map(pl => {
    // Tìm ảnh của bài hát đầu tiên (nếu có bài hát và chưa bị xóa khỏi hệ thống)
    const firstSongCover = pl.songs.length > 0 && pl.songs[0].song ? pl.songs[0].song.coverUrl : null;

    return {
      _id: pl._id,
      name: pl.name,
      description: pl.description,
      createdAt: pl.createdAt,
      songCount: pl.songs.length,
      firstSongCover: firstSongCover // Đóng gói ảnh bìa gửi về cho React
    };
  });

  return {
    data: formattedPlaylists,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit
    }
  };
};

// 5. Lấy CHI TIẾT 1 Playlist (Bao gồm các bài hát)
const getPlaylistById = async (playlistId, userId) => {
  const playlist = await Playlist.findOne({
    _id: playlistId,
    user: userId,
    isDeleted: false
  })
    .select('-isDeleted -__v')
    // Kỹ thuật Nested Populate (Lấy Bài hát, trong Bài hát lấy luôn Nghệ sĩ)
    .populate({
      path: 'songs.song',
      select: '_id title audioUrl coverUrl duration artist',
      populate: {
        path: 'artist',
        select: '_id name'
      }
    });

  if (!playlist) {
    throw new Error('Playlist không tồn tại hoặc đã bị xóa!');
  }

  // Tối ưu UI/UX: Format lại mảng songs để React dễ .map() nhất
  // Vì cấu trúc DB đang là { song: { data_bài_hát }, addedAt: ... }
  // Ta sẽ làm phẳng nó thành { ...data_bài_hát, addedAt: ... }
  const formattedSongs = playlist.songs
    .filter(item => item.song) // Lọc bỏ những bài hát lỡ bị xóa khỏi DB gốc
    .map(item => ({
      addedAt: item.addedAt,
      _id: item.song._id,
      title: item.song.title,
      audioUrl: item.song.audioUrl,
      coverUrl: item.song.coverUrl,
      duration: item.song.duration,
      artist: item.song.artist
    }));

  const totalDuration = formattedSongs.reduce((acc, current) => acc + current.duration, 0);

  return {
    _id: playlist._id,
    name: playlist.name,
    description: playlist.description,
    createdAt: playlist.createdAt,
    totalDuration: totalDuration, // Trả thêm trường này cho UI hiển thị "Tổng thời gian"
    songs: formattedSongs
  };
};

// 6. Thêm bài hát vào Playlist
const addSongToPlaylist = async (playlistId, songId, userId) => {
  // 1. Kiểm tra Playlist có phải của User này không
  const playlist = await Playlist.findOne({ _id: playlistId, user: userId, isDeleted: false });
  if (!playlist) throw new Error('Playlist không tồn tại hoặc bạn không có quyền thao tác!');

  // 2. Kiểm tra Bài hát có thực sự tồn tại trên hệ thống không
  const songExists = await Song.findById(songId);
  if (!songExists) throw new Error('Bài hát này không tồn tại hoặc đã bị xóa khỏi hệ thống!');

  // 3. Kiểm tra bài hát đã có trong Playlist chưa (Tránh add trùng 1 bài 2 lần)
  // Ép kiểu ObjectId về String để so sánh cho chính xác
  const isDuplicate = playlist.songs.some(item => item.song.toString() === songId);
  if (isDuplicate) throw new Error('Bài hát này đã có trong Playlist của bạn rồi!');

  // 4. Thỏa mãn hết thì Push vào mảng và Lưu lại
  playlist.songs.push({ song: songId });
  await playlist.save();

  return playlist;
};

// 7. Xóa bài hát khỏi Playlist
const removeSongFromPlaylist = async (playlistId, songId, userId) => {
  // Tối ưu hóa bậc cao: Dùng $pull để lấy thẳng phần tử ra khỏi mảng ngay tại Database
  // { new: true } để Mongoose trả về document SAU khi đã update xong
  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, user: userId, isDeleted: false },
    { $pull: { songs: { song: songId } } },
    { new: true }
  );

  if (!playlist) throw new Error('Playlist không tồn tại hoặc bạn không có quyền thao tác!');

  return playlist;
};

// 8. Kéo thả đổi thứ tự bài hát trong Playlist
const reorderSongs = async (playlistId, userId, songId, newIndex) => {
  const playlist = await Playlist.findOne({ _id: playlistId, user: userId, isDeleted: false });
  if (!playlist) throw new Error('Playlist không tồn tại hoặc không có quyền thao tác!');

  // Tìm vị trí hiện tại của bài hát trong mảng
  const currentIndex = playlist.songs.findIndex(item => item.song.toString() === songId);
  if (currentIndex === -1) throw new Error('Bài hát không tồn tại trong Playlist này!');

  // Đảm bảo newIndex hợp lệ (không vượt quá chiều dài mảng)
  const targetIndex = Math.max(0, Math.min(newIndex, playlist.songs.length - 1));

  // Kỹ thuật Javascript Splice: Rút phần tử ra khỏi vị trí cũ...
  const [songToMove] = playlist.songs.splice(currentIndex, 1);
  
  // ...và chèn nó vào vị trí mới
  playlist.songs.splice(targetIndex, 0, songToMove);

  await playlist.save();
  return playlist;
};

// CẬP NHẬT LẠI PASSPORT CHO CÁC HÀM XUẤT NGOẠI NHÉ (Thêm 2 hàm mới vào cuối)
module.exports = {
  createPlaylist,
  updatePlaylist,
  softDeletePlaylist,
  getUserPlaylists,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderSongs
};

