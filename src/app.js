const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const authRouter = require('./routes/authRouter.js');
const usersRouter = require('./routes/usersRouter.js');
const songRoutes = require('./routes/song.routes.js');
const searchRoutes = require('./routes/search.route.js');
const playlistRoutes = require('./routes/playlist.route.js');
const followRoutes = require('./routes/follow.routes.js');

const errorHandler = require('./middlewares/errorHandler.js');

dotenv.config();

const app = express();


// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ================= UPLOAD CONFIG =================
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// serve static file
app.use('/uploads', express.static(UPLOADS_DIR));


// ================= ROUTES =================
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/songs', songRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/playlists', playlistRoutes);
app.use('/api/v1/follow', followRoutes);


// ================= TEST ROUTE =================
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Chào mừng đến với API của PrimeSound!'
    });
});
app.use(errorHandler);

module.exports = app;