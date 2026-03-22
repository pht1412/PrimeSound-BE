const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const authRouter = require('./routes/authRouter');
const usersRouter = require('./routes/usersRouter');
const songRoutes = require('./routes/song.routes');
const searchRoutes = require('./routes/search.route');
const playlistRoutes = require('./routes/playlist.route');

const errorHandler = require('./middlewares/errorHandler');

dotenv.config();

const app = express();


// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ================= UPLOAD CONFIG =================
// 👉 tự define lại vì không dùng import
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// serve static file
app.use('/uploads', express.static(UPLOADS_DIR));


// ================= ROUTES =================
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/songs', songRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/playlists', playlistRoutes);


// ================= TEST ROUTE =================
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Chào mừng đến với API của PrimeSound!'
    });
});
app.use(errorHandler);

module.exports = app;