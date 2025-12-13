import express from 'express';
import { login } from '../controllers/auth.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireUser } from '../middleware/requireUser.js';

const router = express.Router();

// Public routes

router.post('/login', login);

// Protected routes



export default router;
