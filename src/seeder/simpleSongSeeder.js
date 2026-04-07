const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Artist = require('../models/artist.model');
const Song = require('../models/song.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/primesound_db';

const demoSongs = [
  {
    title: 'Summer Vibes',
    genre: 'Pop',
    artistName: 'Beach Boys',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    duration: 420,
    playCount: 5000,
  },
  {
    title: 'Electric Dreams',
    genre: 'Electronic',
    artistName: 'Synth Wave',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=900&q=80',
    duration: 380,
    playCount: 3500,
  },
  {
    title: 'Ocean Breeze',
    genre: 'Chill',
    artistName: 'Wave Riders',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=80',
    duration: 290,
    playCount: 2100,
  },
  {
    title: 'City Nights',
    genre: 'Jazz',
    artistName: 'Urban Beats',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80',
    duration: 315,
    playCount: 4200,
  },
  {
    title: 'Mountain Echo',
    genre: 'Acoustic',
    artistName: 'Nature Sounds',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80',
    duration: 260,
    playCount: 1800,
  },
];

const seedSongs = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Tìm hoặc tạo user demo
    let demoUser = await User.findOne({ email: 'demo@primesound.local' });
    if (!demoUser) {
      console.log('Tạo user demo...');
      const hashedPassword = await User.hashPassword('123456');
      demoUser = await User.create({
        name: 'Demo User',
        email: 'demo@primesound.local',
        password: hashedPassword,
        role: 'user',
        avatar: 'https://via.placeholder.com/150/1ed760/000000?text=DU',
      });
    }

    // Tạo artist
    let artist = await Artist.findOne({ name: 'Various Artists' });
    if (!artist) {
      artist = await Artist.create({
        name: 'Various Artists',
        avatarUrl: '',
      });
    }

    // Tạo các bài hát
    let count = 0;
    for (const songData of demoSongs) {
      const existing = await Song.findOne({ title: songData.title });
      if (!existing) {
        await Song.create({
          uploadedBy: demoUser._id,
          artist: artist._id,
          title: songData.title,
          genre: songData.genre,
          audioUrl: songData.audioUrl,
          coverUrl: songData.coverUrl,
          duration: songData.duration,
          playCount: songData.playCount,
          status: 'approved',
        });
        count++;
        console.log(`✓ Đã tạo: ${songData.title}`);
      } else {
        console.log(`- Đã tồn tại: ${songData.title}`);
      }
    }

    console.log(`\nHoàn tất! Đã tạo ${count} bài hát mới.`);
    console.log('\nĐăng nhập: demo@primesound.local / 123456');

  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedSongs();
