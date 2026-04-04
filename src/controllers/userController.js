const userService = require('../services/userService.js');
const { asyncHandler } = require('../utils/asyncHandler.js');

const getMe = asyncHandler(async (req, res) => {
    const user = await userService.getCurrentUser(req.user._id);
    res.status(200).json(user);
});

const patchMe = asyncHandler(async (req, res) => {
    const user = await userService.updateCurrentUserProfile(
        req.user._id,
        { name: req.body.name },
        req.file
    );
    res.status(200).json(user);
});

const patchPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const result = await userService.changePassword(
        req.user._id,
        oldPassword,
        newPassword
    );
    res.status(200).json(result);
});

// --- Admin CRUD ---

const getAllUsers = asyncHandler(async (req, res) => {
    const result = await userService.listUsers();
    res.status(200).json(result);
});


const updateUser = asyncHandler(async (req, res) => {
    const { name, email, role } = req.body;
    const result = await userService.updateUserById(req.params.id, {
        name,
        email,
        role
    });
    res.status(200).json(result);
});

const deleteUser = asyncHandler(async (req, res) => {
    const result = await userService.deleteUserById(req.params.id);
    res.status(200).json(result);
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ 
            success: false, 
            message: "Không tìm thấy người dùng" 
        });
    }
    
    // Gói dữ liệu vào object có trường data để Frontend dễ dàng bóc tách
    res.status(200).json({
        success: true,
        data: user
    });
});

module.exports = {
    getMe,
    patchMe,
    patchPassword,
    getAllUsers,
    updateUser,
    deleteUser,
    getUserById
};
