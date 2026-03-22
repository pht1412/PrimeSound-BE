import express from 'express';
<<<<<<< HEAD
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import { auth } from '../middlewares/auth.js';
=======
import { auth } from '../middlewares/auth.js';
import { uploadAvatar } from '../middlewares/uploadAvatar.js';
import * as userController from '../controllers/userController.js';
>>>>>>> origin/feature/auth-and-profile-apis

const router = express.Router();

router.get('/me', auth, userController.getMe);
router.patch(
    '/me',
    auth,
    uploadAvatar.single('avatar'),
    userController.patchMe
);
router.patch('/me/password', auth, userController.patchPassword);

// --- CRUD (admin / nội bộ) — đặt sau /me để không bị :id nuốt ---

router.get('/', auth, userController.getAllUsers);
router.get('/:id', auth, userController.getUser);
router.put('/:id', auth, userController.updateUser);
router.delete('/:id', auth, userController.deleteUser);

export default router;
