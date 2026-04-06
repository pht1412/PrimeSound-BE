const jwt = require('jsonwebtoken');

const JWT_SECRET =
    process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// tạo access token (hết hạn trong 15p)
const generateAccessToken = (userId, role) => {
    return jwt.sign({ _id: userId, role }, JWT_SECRET, {
        expiresIn: '15m'
    });
};

// tạo refresh token (hết hạn trong 7 ngày)
const generateRefreshToken = (userId, role) => {
    return jwt.sign({ _id: userId, role, type: 'refresh' }, JWT_SECRET, {
        expiresIn: '7d'
    });
};

// verify token
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = {
    JWT_SECRET,
    generateAccessToken,
    generateRefreshToken,
    verifyToken
};