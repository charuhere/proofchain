import express from 'express';
import { getGoogleAuthURL, googleCallback } from '../controllers/gmailAuth.js';

const router = express.Router();

// 1. Frontend calls this to get the "Sign in with Google" link
router.get('/url', getGoogleAuthURL);

// 2. Google sends the user back here after they click "Allow"
router.get('/callback', googleCallback);

export default router;