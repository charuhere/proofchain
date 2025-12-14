import User from '../config/User.js';

export const login = async (req, res, next) => {
  try {
    const { user: supabaseUser } = req.body;

    if (!supabaseUser || !supabaseUser.id || !supabaseUser.email) {
      return res.status(400).json({ error: 'Invalid user data provided for sync' });
    }

    const { id: supabaseUid, email } = supabaseUser;
    const fullName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.fullName || 'User';

    // Check if user exists by Supabase UID
    let user = await User.findOne({ supabaseUid });

    if (!user) {
      // Fallback: Check by email for legacy users
      user = await User.findOne({ email });

      if (user) {
        // Link legacy user
        user.supabaseUid = supabaseUid;
        await user.save();
      } else {
        // Create New User
        user = new User({
          supabaseUid,
          email,
          fullName,
          gmailConnected: false,
          isVerified: true // Email confirmed by Supabase
        });
        await user.save();
      }
    }

    // Return the USER object (Mongo) so frontend has context
    res.json({
      message: 'User synced successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        reminderPreference: user.reminderPreference,
        gmailConnected: user.gmailConnected,
      }
    });

  } catch (error) {
    next(error);
  }
};