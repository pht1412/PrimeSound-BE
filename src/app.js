const express = require('express');
const cors = require('cors');
require('dotenv').config();

const songRoutes = require('./routes/song.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/songs', songRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Chào mừng đến với API của PrimeSound!' });
});

module.exports = app;