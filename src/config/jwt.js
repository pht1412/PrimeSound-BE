const jwt = require('jsonwebtoken');

const JWT_SECRET =
    process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// tạo token
const generateToken = (userId, role) => {
    return jwt.sign({ _id: userId, role }, JWT_SECRET, {
        expiresIn: '7d'
    });
};

// verify token (bonus – rất nên có)
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = {
    JWT_SECRET,
    generateToken,
    verifyToken
};