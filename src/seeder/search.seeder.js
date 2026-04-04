// src/seeders/search.seeder.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import các models đã tạo
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Artist = require('../models/artist.model');
const Song = require('../models/song.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/primesound_db';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Đã kết nối DB để chạy Seeder...');

    // 1. Xóa dữ liệu cũ để tránh trùng lặp khi chạy nhiều lần
    await Promise.all([User.deleteMany(), Role.deleteMany(), Artist.deleteMany(), Song.deleteMany()]);

    // 2. Tạo một Role và User ảo để thỏa mãn schema
    const roleUser = await Role.create({ roleName: 'user' });
    const dummyUser = await User.create({
      name: 'admin',
      role: 'admin',
      email: 'admin@primesound.vn',
      password: "123456",
      passwordHash: '123456',
      fullName: 'PrimeSound Admin'
    });

    // 3. Tạo Nghệ sĩ
    const mtp = await Artist.create({ name: 'Sơn Tùng M-TP', avatarUrl: 'link_anh_mtp.jpg' });
    const den = await Artist.create({ name: 'Đen Vâu', avatarUrl: 'link_anh_den.jpg' });

    // 4. Tạo Bài hát (Lưu ý cái nào approved, cái nào pending)
    await Song.insertMany([
      {
        uploadedBy: dummyUser._id,
        artist: mtp._id,
        title: 'Chúng Ta Của Hiện Tại',
        audioUrl: 'link_audio_1.mp3',
        duration: 300,
        moderationStatus: 'approved' // Sẽ được tìm thấy
      },
      {
        uploadedBy: dummyUser._id,
        artist: mtp._id,
        title: 'Chạy Ngay Đi',
        audioUrl: 'link_audio_2.mp3',
        duration: 250,
        moderationStatus: 'pending' // KHÔNG được tìm thấy vì chưa duyệt
      },
      {
        uploadedBy: dummyUser._id,
        artist: den._id,
        title: 'Trốn Tìm',
        audioUrl: 'link_audio_3.mp3',
        duration: 280,
        moderationStatus: 'approved' // Sẽ được tìm thấy
      }
    ]);

    console.log('✅ Đã tạo Seeder thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi tạo Seeder:', error);
    process.exit(1);
  }
};

seedData();