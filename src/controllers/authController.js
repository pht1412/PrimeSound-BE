const authService = require('../services/authService.js');
const { asyncHandler } = require('../utils/asyncHandler.js');

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });
    res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    res.status(200).json(result);
});

const logout = (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
    register,
    login,
    logout
};
