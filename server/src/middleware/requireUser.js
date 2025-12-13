import User from '../config/User.js';

/**
 * Middleware to find or create a MongoDB user for the authenticated Supabase user.
 * Populates req.userId with the MongoDB _id.
 */
export const requireUser = async (req, res, next) => {
    try {
        const supabaseUid = req.supabaseUid;
        const { email, fullName, picture } = req.body.user || {}; // user metadata from client if signing up/syncing for first time

        // 1. Try to find by supabaseUid
        let user = await User.findOne({ supabaseUid });

        // 2. If not found by uid, try to find by email (legacy migration)
        if (!user && email) {
            user = await User.findOne({ email });
            if (user) {
                // Link existing user
                user.supabaseUid = supabaseUid;
                await user.save();
            }
        }

        // 3. If still not found, create new user (Sync on the fly)
        if (!user && email) {
            // If we have email, we can create. If only checking auth for existing user, we might fail here.
            user = new User({
                supabaseUid,
                email,
                fullName: fullName || 'New User',
                profileImage: picture || null,
                gmailConnected: false
            });
            await user.save();
        }

        if (!user) {
            // Fallback: If we don't have user info in body and not in DB
            // Ideally client should call a /sync endpoint first, but let's try to handle graceful failure
            return res.status(404).json({
                success: false,
                message: 'User account not found or not synced. Please Log In again to sync.'
            });
        }

        req.userId = user._id;
        next();
    } catch (error) {
        console.error('User Sync Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to synchronize user account',
            error: error.message
        });
    }
};
