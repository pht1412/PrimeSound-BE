const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Artist = require('../models/artist.model');
const Song = require('../models/song.model');
const Comment = require('../models/comment.model');
const Repost = require('../models/repost.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/primesound_db';

const demoUsers = [
  {
    name: 'Demo User',
    email: 'demo@primesound.local',
    password: '123456',
    role: 'user',
    avatar: 'https://via.placeholder.com/150/1ed760/000000?text=DU',
  },
  {
    name: 'Minh Tuan',
    email: 'minhtuan@primesound.local',
    password: '123456',
    role: 'user',
    avatar: 'https://via.placeholder.com/150/2563eb/ffffff?text=MT',
  },
  {
    name: 'Thao Vy',
    email: 'thaovy@primesound.local',
    password: '123456',
    role: 'user',
    avatar: 'https://via.placeholder.com/150/9333ea/ffffff?text=TV',
  },
];

const demoSongs = [
  {
    title: 'Midnight City Lights',
    genre: 'Chill Pop',
    artistName: 'PrimeSound Studio',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
    duration: 376,
    playCount: 3281,
  },
  {
    title: 'Rainy Window',
    genre: 'Lofi',
    artistName: 'PrimeSound Studio',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    duration: 302,
    playCount: 1842,
  },
];

const upsertUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    return existingUser;
  }

  const hashedPassword = await User.hashPassword(userData.password);
  return User.create({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: userData.role,
    avatar: userData.avatar,
  });
};

const upsertArtist = async (artistName) => {
  const existingArtist = await Artist.findOne({ name: artistName });
  if (existingArtist) {
    return existingArtist;
  }

  return Artist.create({
    name: artistName,
    avatarUrl: '',
  });
};

const upsertSong = async (songData, uploadedBy, artistId) => {
  const existingSong = await Song.findOne({ title: songData.title });
  if (existingSong) {
    return existingSong;
  }

  return Song.create({
    uploadedBy,
    artist: artistId,
    title: songData.title,
    genre: songData.genre,
    audioUrl: songData.audioUrl,
    coverUrl: songData.coverUrl,
    duration: songData.duration,
    playCount: songData.playCount,
    status: 'approved',
  });
};

const ensureComment = async ({ songId, userId, content, likes = [] }) => {
  const existingComment = await Comment.findOne({ song: songId, user: userId, content });
  if (existingComment) {
    return existingComment;
  }

  return Comment.create({
    song: songId,
    user: userId,
    content,
    likes,
  });
};

const ensureRepost = async ({ songId, userId, note = '' }) => {
  const existingRepost = await Repost.findOne({ song: songId, user: userId });
  if (existingRepost) {
    if (note && existingRepost.note !== note) {
      existingRepost.note = note;
      await existingRepost.save();
    }
    return existingRepost;
  }

  return Repost.create({
    song: songId,
    user: userId,
    note,
  });
};

const seedDemoContent = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for demo content seeding.');

    const createdUsers = {};
    for (const userData of demoUsers) {
      const user = await upsertUser(userData);
      createdUsers[userData.email] = user;
    }

    const artist = await upsertArtist('PrimeSound Studio');
    const seededSongs = [];

    for (const songData of demoSongs) {
      const song = await upsertSong(songData, createdUsers['demo@primesound.local']._id, artist._id);
      seededSongs.push(song);
    }

    await ensureComment({
      songId: seededSongs[0]._id,
      userId: createdUsers['minhtuan@primesound.local']._id,
      content: 'Bai nay mo len la thay app co khong khi liem ngay. Comment panel hop voi track roi do.',
      likes: [createdUsers['demo@primesound.local']._id],
    });

    await ensureComment({
      songId: seededSongs[0]._id,
      userId: createdUsers['thaovy@primesound.local']._id,
      content: 'Mau comment nay de test luon flow like va hien thi theo tung bai hat.',
      likes: [],
    });

    await ensureComment({
      songId: seededSongs[1]._id,
      userId: createdUsers['demo@primesound.local']._id,
      content: 'Track thu hai de minh test chuyen bai la comment doi theo dung songId.',
      likes: [createdUsers['minhtuan@primesound.local']._id],
    });

    await ensureRepost({
      songId: seededSongs[0]._id,
      userId: createdUsers['demo@primesound.local']._id,
      note: 'Track này nghe khá hợp để test luồng repost trong Home.',
    });

    await ensureRepost({
      songId: seededSongs[0]._id,
      userId: createdUsers['minhtuan@primesound.local']._id,
      note: 'Mình repost bài này để kiểm tra panel hoạt động theo từng bài hát.',
    });

    await ensureRepost({
      songId: seededSongs[1]._id,
      userId: createdUsers['thaovy@primesound.local']._id,
      note: 'Bài thứ hai cũng có repost riêng để đổi dữ liệu theo songId.',
    });

    console.log('Seeded demo songs, comments and reposts successfully.');
  } catch (error) {
    console.error('Demo seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDemoContent();
