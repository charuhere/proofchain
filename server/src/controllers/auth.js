import { findOrCreateUser } from '../middleware/requireUser.js';

/**
 * Sync Supabase user with MongoDB database.
 * Called after Supabase authentication to ensure user exists in our DB.
 */
export const login = async (req, res, next) => {
  try {
    const { user: supabaseUser } = req.body;

    if (!supabaseUser?.id || !supabaseUser?.email) {
      return res.status(400).json({ error: 'Invalid user data provided for sync' });
    }

    const fullName = supabaseUser.user_metadata?.full_name
      || supabaseUser.user_metadata?.fullName
      || 'User';

    const user = await findOrCreateUser(supabaseUser.id, supabaseUser.email, fullName);

    res.json({
      message: 'User synced successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        gmailConnected: user.gmailConnected,
      }
    });
  } catch (error) {
    next(error);
  }
};