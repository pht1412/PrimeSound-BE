const express = require('express');
const router = express.Router();

// ✅ destructuring đúng
const { auth } = require('../middlewares/auth');

// ⚠️ uploadAvatar thường export trực tiếp
const uploadAvatar = require('../middlewares/uploadAvatar');

const userController = require('../controllers/userController');


// ===== USER PROFILE =====
router.get('/me', auth, userController.getMe);

router.patch(
    '/me',
    auth,
    uploadAvatar.single('avatar'),
    userController.patchMe
);

router.patch('/me/password', auth, userController.patchPassword);


// ===== CRUD (ADMIN / INTERNAL) =====
// đặt sau /me để tránh conflict với :id
router.get('/', auth, userController.getAllUsers);
router.get('/:id', auth, userController.getUser);
router.put('/:id', auth, userController.updateUser);
router.delete('/:id', auth, userController.deleteUser);


// ===== EXPORT =====
module.exports = router;