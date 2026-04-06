const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');
const { AppError } = require('../utils/AppError');
const { sendVerificationEmail, sendResetPasswordEmail } = require('./emailService');
const crypto = require('crypto');

const DEFAULT_AVATAR = 'https://via.placeholder.com/150';

// format dữ liệu trả về client
const toPublicUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    isVerified: user.isVerified
});

// ===== REGISTER =====
const registerUser = async ({ name, email, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email already exists', 400);
    }

    const hashedPassword = await User.hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
        name,
        email,
        password: hashedPassword,
        avatar: DEFAULT_AVATAR,
        role: 'user',
        isVerified: false,
        verificationToken
    });

    await user.save();

    try {
        await sendVerificationEmail({ email, name, verificationToken });
    } catch (err) {
        console.warn('⚠️ Could not send verification email:', err.message);
    }

    const token = generateAccessToken(user._id, user.role);

    return {
        message: 'Registration successful. Please check your email to verify your account.',
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

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    return {
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: toPublicUser(user)
    };
};

// ===== LOGOUT =====
const logoutUser = async (userId) => {
    return {
        message: 'Logged out successfully'
    };
};

// ===== FORGOT PASSWORD =====
const forgotPassword = async ({ email }) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('Email not found', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save();

    try {
        await sendResetPasswordEmail({ email: user.email, name: user.name, resetToken });
    } catch (err) {
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        throw new AppError('Failed to send reset email', 500);
    }

    return {
        message: 'Password reset email sent. Please check your email.'
    };
};

// ===== RESET PASSWORD =====
const resetPassword = async ({ token, password }) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = await User.hashPassword(password);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.isVerified = true; // auto verify khi reset thành công
    await user.save();

    return {
        message: 'Password reset successful. Please login with your new password.'
    };
};

// ===== VERIFY EMAIL =====
const verifyEmail = async ({ token }) => {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        throw new AppError('Invalid verification token', 400);
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    return {
        message: 'Email verified successfully.'
    };
};

// ===== RESEND VERIFICATION EMAIL =====
const resendVerification = async ({ email }) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('Email not found', 404);
    }

    if (user.isVerified) {
        throw new AppError('Email already verified', 400);
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    try {
        await sendVerificationEmail({ email: user.email, name: user.name, verificationToken });
    } catch (err) {
        throw new AppError('Failed to send verification email', 500);
    }

    return {
        message: 'Verification email resent. Please check your email.'
    };
};

// ===== REFRESH TOKEN =====
const refreshAccessToken = async ({ refreshToken }) => {
    try {
        const decoded = verifyToken(refreshToken);

        if (decoded.type !== 'refresh') {
            throw new AppError('Invalid refresh token', 401);
        }

        const user = await User.findById(decoded._id);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const newAccessToken = generateAccessToken(user._id, user.role);
        const newRefreshToken = generateRefreshToken(user._id, user.role);

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: toPublicUser(user)
        };
    } catch (error) {
        throw new AppError('Invalid or expired refresh token', 401);
    }
};

// ===== EXPORT =====
module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    refreshAccessToken
};
