const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const { JWT_SECRET } = require('../config/jwt.js');

/** Bắt buộc đăng nhập - trả 401 nếu không có token */
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.replace('Bearer ', '');

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded._id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

/** Tùy chọn đăng nhập - nếu có token thì gán req.user, không có thì req.user = null */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.replace('Bearer ', '');

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded._id).select('-password');

        req.user = user || null;
        req.token = user ? token : null;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

/** Yêu cầu role admin - dùng sau auth */
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

module.exports = { auth, optionalAuth, requireAdmin };
