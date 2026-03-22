import express from 'express';
<<<<<<< HEAD
import User from '../models/User.js';
import { generateToken } from '../middlewares/auth.js';
=======
import * as authController from '../controllers/authController.js';
>>>>>>> origin/feature/auth-and-profile-apis

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

export default router;
