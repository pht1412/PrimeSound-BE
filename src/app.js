import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import authRouter from './routes/authRouter.js';
import usersRouter from './routes/usersRouter.js';
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const songRoutes = require('./routes/song.routes');

import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import authRouter from './routes/authRouter.js';
import usersRouter from './routes/usersRouter.js';
const songRoutes = require('./routes/song.routes');
const searchRoutes = require('./routes/search.route'); 
const playlistRoutes = require('./routes/playlist.route');



const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/songs', songRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Chào mừng đến với API của PrimeSound!' });
});

module.exports = app;
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);

export default app;
// Khai báo prefix cho API
app.use('/api/v1/search', searchRoutes); 
app.use('/api/v1/playlists', playlistRoutes);
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Chào mừng đến với API của PrimeSound!' });
});

module.exports = app;
