import User from '../config/User.js';

/**
 * Find existing MongoDB user or create new one from Supabase data.
 * Handles legacy email-based migration automatically.
 * 
 * @param {string} supabaseUid - Supabase user ID
 * @param {string} email - User email
 * @param {string} fullName - User's full name
 * @returns {Promise<User|null>} - MongoDB user document or null
 */
export const findOrCreateUser = async (supabaseUid, email, fullName = 'User') => {
    // 1. Find by Supabase UID (primary lookup)
    let user = await User.findOne({ supabaseUid });

    // 2. Legacy migration: find by email and link
    if (!user && email) {
        user = await User.findOne({ email });
        if (user) {
            user.supabaseUid = supabaseUid;
            await user.save();
        }
    }

    // 3. Create new user if not found
    if (!user && email) {
        user = new User({
            supabaseUid,
            email,
            fullName,
            gmailConnected: false,
            isVerified: true
        });
        await user.save();
    }

    return user;
};

/**
 * Middleware to ensure a valid MongoDB user exists for the authenticated Supabase user.
 * Populates req.userId with the MongoDB _id.
 */
export const requireUser = async (req, res, next) => {
    try {
        const { email, fullName } = req.body.user || {};
        const user = await findOrCreateUser(req.supabaseUid, email, fullName);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please log in again.'
            });
        }

        req.userId = user._id;
        next();
    } catch (error) {
        console.error('User Sync Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to synchronize user account'
        });
    }
};
