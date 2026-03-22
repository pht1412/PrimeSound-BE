import * as userService from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMe = asyncHandler(async (req, res) => {
    const user = await userService.getCurrentUser(req.user._id);
    res.status(200).json(user);
});

export const patchMe = asyncHandler(async (req, res) => {
    const user = await userService.updateCurrentUserProfile(
        req.user._id,
        { name: req.body.name },
        req.file
    );
    res.status(200).json(user);
});

export const patchPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const result = await userService.changePassword(
        req.user._id,
        oldPassword,
        newPassword
    );
    res.status(200).json(result);
});

// --- Admin CRUD ---

export const getAllUsers = asyncHandler(async (req, res) => {
    const result = await userService.listUsers();
    res.status(200).json(result);
});

export const getUser = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json(user);
});

export const updateUser = asyncHandler(async (req, res) => {
    const { name, email, role } = req.body;
    const result = await userService.updateUserById(req.params.id, {
        name,
        email,
        role
    });
    res.status(200).json(result);
});

export const deleteUser = asyncHandler(async (req, res) => {
    const result = await userService.deleteUserById(req.params.id);
    res.status(200).json(result);
});
