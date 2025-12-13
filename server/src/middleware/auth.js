import jwt from 'jsonwebtoken';
import { getTokenFromHeaders } from '../utils/auth.js';

/**
 * Middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authMiddleware = (req, res, next) => {
  try {
    const token = getTokenFromHeaders(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login.'
      });
    }

    // Verify Supabase Token
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);

    // Attach Supabase UID (sub) to request
    req.supabaseUid = decoded.sub;

    // NOTE: We will populate req.userId (Mongo ID) in the controller or a subsequent middleware
    // For now, we pass the Supabase ID along.

    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
      error: error.message
    });
  }
};

/**
 * Middleware to handle errors
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : {}
  });
};
