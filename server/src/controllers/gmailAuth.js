import { google } from 'googleapis';
import User from '../config/User.js';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,      
  process.env.GMAIL_CLIENT_SECRET,  
  process.env.GMAIL_CALLBACK_URL  
);

// 1. Generate the Google Login URL
export const getGoogleAuthURL = (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email', // To verify who they are
    'https://www.googleapis.com/auth/gmail.readonly'  // To read receipts
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // CRITICAL: This gives us the Refresh Token
    scope: scopes,
    prompt: 'consent' // Forces Google to give a new refresh token every time
  });

  res.json({ url });
};

// 2. Handle the Callback (When Google sends them back)
export const googleCallback = async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange the "code" for actual Tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user email to find them in DB
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    // Find user and save the Refresh Token
    // Note: In a real app, you might use req.user.id from a session/JWT instead
    const user = await User.findOneAndUpdate(
      { email: email }, 
      { 
        gmailConnected: true,
        gmailRefreshToken: tokens.refresh_token, // Save this key!
        gmailAccessToken: tokens.access_token
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found. Please sign up first." });
    }

    // Redirect back to Frontend Dashboard
    res.redirect('http://localhost:3000/dashboard?gmail=success');

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.redirect('http://localhost:3000/dashboard?gmail=failed');
  }
};
