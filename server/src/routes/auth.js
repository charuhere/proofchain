import express from 'express';
import { signup, login, getCurrentUser } from '../controllers/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireUser } from '../middleware/requireUser.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, requireUser, getCurrentUser);


export default router;
