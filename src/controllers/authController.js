const authService = require('../services/authService.js');
const { asyncHandler } = require('../utils/asyncHandler.js');

// POST /auth/register
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });
    res.status(201).json(result);
});

// POST /auth/login
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    res.status(200).json(result);
});

// POST /auth/logout
const logout = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const result = await authService.logoutUser(userId);
    res.status(200).json(result);
});

// POST /auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await authService.forgotPassword({ email });
    res.status(200).json(result);
});

// POST /auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    const result = await authService.resetPassword({ token, password });
    res.status(200).json(result);
});

// POST /auth/verify-email/:token
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const result = await authService.verifyEmail({ token });
    res.status(200).json(result);
});

// POST /auth/resend-verification
const resendVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await authService.resendVerification({ email });
    res.status(200).json(result);
});

// POST /auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken({ refreshToken });
    res.status(200).json(result);
});

module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    refreshToken
};
