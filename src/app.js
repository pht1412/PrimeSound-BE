const express = require('express');
const cors = require('cors');

// Import routes
const searchRoutes = require('./routes/search.route'); 
const playlistRoutes = require('./routes/playlist.route');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Khai báo prefix cho API
app.use('/api/v1/search', searchRoutes); 
app.use('/api/v1/playlists', playlistRoutes);
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Chào mừng đến với API của PrimeSound!' });
});

module.exports = app;