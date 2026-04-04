const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { AppError } = require('../utils/AppError');

const DEFAULT_AVATAR = 'https://via.placeholder.com/150';

// format dữ liệu trả về client
const toPublicUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role
});

// ===== REGISTER =====
const registerUser = async ({ name, email, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email already exists', 400);
    }

    const hashedPassword = await User.hashPassword(password);

    const user = new User({
        name,
        email,
        password: hashedPassword,
        avatar: DEFAULT_AVATAR,
        role: 'user'
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    return {
        message: 'Registration successful',
        token,
        user: toPublicUser(user)
    };
};

// ===== LOGIN =====
const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('Invalid email or password', 400);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new AppError('Invalid email or password', 400);
    }

    const token = generateToken(user._id, user.role);

    return {
        message: 'Login successful',
        token,
        user: toPublicUser(user)
    };
};


// ===== EXPORT =====
module.exports = {
    registerUser,
    loginUser
};