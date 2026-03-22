import express from 'express';
import { auth } from '../middlewares/auth.js';
import { uploadAvatar } from '../middlewares/uploadAvatar.js';
import * as userController from '../controllers/userController.js';

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
