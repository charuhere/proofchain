import { google } from 'googleapis';
import User from '../config/User.js';
import { extractProductInfo, generateKeywords, extractClaimDetails } from '../services/groq.js';
import { redactSensitiveData } from '../utils/privacy.js';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * Extract common email headers (Subject, From, Date)
 */
const getEmailHeaders = (headers) => ({
  subject: headers.find(h => h.name === 'Subject')?.value || 'No Subject',
  from: headers.find(h => h.name === 'From')?.value || 'Unknown Sender',
  date: headers.find(h => h.name === 'Date')?.value || new Date().toISOString()
});

/**
 * Setup Gmail client with user's refresh token
 */
const getGmailClient = async (userId) => {
  const user = await User.findById(userId).select('+gmailRefreshToken');
  if (!user?.gmailRefreshToken) return null;

  oauth2Client.setCredentials({ refresh_token: user.gmailRefreshToken });
  return { gmail: google.gmail({ version: 'v1', auth: oauth2Client }), user };
};

export const scanInbox = async (req, res) => {
  try {
    // Get Gmail client using helper
    const client = await getGmailClient(req.userId);
    if (!client) {
      return res.status(401).json({
        success: false,
        message: 'Gmail not connected. Please connect Gmail first.'
      });
    }
    const { gmail, user } = client;

    // 3. Search for recent emails (Last 30 days, containing keywords)
    // q: query format used in Gmail search bar
    const query = 'subject:(invoice OR receipt OR warranty OR "order confirmation") newer_than:30d';

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 10 // Limit to 10 for now to test speed
    });

    const messages = response.data.messages || [];

    if (messages.length === 0) {
      return res.json({ success: true, message: "No new bills found.", count: 0 });
    }

    // 4. Fetch details for each email
    const emailDetails = [];

    for (const msg of messages) {
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full' // We need the body/snippet
      });

      const headers = email.data.payload.headers;
      const { subject, from, date } = getEmailHeaders(headers);
      const snippet = email.data.snippet || '';

      // Extract attachments info
      const payload = email.data.payload;
      let attachments = [];
      if (payload.parts) {
        payload.parts.forEach(part => {
          if (part.filename) {
            attachments.push({
              filename: part.filename,
              sizeKB: Math.round((part.body.size || 0) / 1024)
            });
          }
        });
      }

      // Basic filtering (We will add AI/Gemini check here later)
      emailDetails.push({
        gmailId: msg.id,
        subject,
        from,
        date,
        snippet,
        contentPreview: snippet.substring(0, 300),
        attachments,
        status: 'found'
      });
    }

    // 5. Update last scan date
    user.lastEmailScanDate = new Date();
    await user.save();

    res.json({
      success: true,
      count: emailDetails.length,
      data: emailDetails
    });

  } catch (error) {
    console.error('Gmail Scan Error:', error);

    // If token is invalid, user might need to reconnect
    if (error.response?.status === 400 || error.response?.status === 401) {
      return res.status(401).json({ message: "Gmail connection expired. Please reconnect." });
    }

    res.status(500).json({ message: 'Failed to scan inbox' });
  }
};




export const importEmail = async (req, res) => {
  try {
    const { id } = req.params;

    // Setup Gmail client using helper
    const client = await getGmailClient(req.userId);
    if (!client) {
      return res.status(401).json({ success: false, message: 'Gmail not connected' });
    }
    const { gmail } = client;

    // Fetch Full Email Content
    const email = await gmail.users.messages.get({
      userId: 'me',
      id: id,
      format: 'full'
    });

    const payload = email.data.payload;
    const { subject, from, date: emailDate } = getEmailHeaders(payload.headers);

    // D. Helper to find text body
    let emailBody = '';
    let attachments = [];

    if (payload.parts) {
      payload.parts.forEach(part => {
        // Extract text body
        if (part.mimeType === 'text/plain' && part.body.data && !emailBody) {
          emailBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
        // Extract attachments metadata
        if (part.filename) {
          attachments.push({
            filename: part.filename,
            size: part.body.size || 0,
            mimeType: part.mimeType
          });
        }
      });
    } else if (payload.body.data) {
      emailBody = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    // E. Redact sensitive data before sending to Groq
    const redactedBody = redactSensitiveData(emailBody);

    // F. Ask AI to analyze redacted content
    console.log("Analyzing email with Groq...");
    const aiData = await extractProductInfo(redactedBody.substring(0, 2000));

    // G. Generate keywords using the same function as bill upload
    let keywords = [];
    try {
      keywords = await generateKeywords(redactedBody.substring(0, 2000), aiData.productName || "Product");
    } catch (error) {
      console.error('Keyword generation error:', error);
      keywords = [aiData.store, "gmail-import"]; // Fallback
    }

    // H. Extract warranty claim details
    let claimDetails = { brand: 'Unknown', storeEmail: '', storePhone: '', warrantyDetailsText: '' };
    try {
      claimDetails = await extractClaimDetails(redactedBody.substring(0, 2000));
    } catch (error) {
      console.error('Claim details extraction error:', error);
    }

    // I. Return bill data with keywords and claim details
    res.json({
      success: true,
      data: {
        productName: aiData.productName || "Unknown Product",
        storeName: aiData.store || "Unknown Store",
        purchasePrice: aiData.price || 0,
        purchaseDate: emailDate || new Date(),
        expiryDate: new Date(Date.now() + 31536000000), // Default 1 year warranty
        billImageUrl: "https://placehold.co/400x600?text=Gmail+Receipt",
        keywords: keywords,
        warrantyYears: 1,
        description: emailBody.substring(0, 200),
        // Warranty claim details
        brand: claimDetails.brand,
        storeEmail: claimDetails.storeEmail,
        storePhone: claimDetails.storePhone,
        warrantyDetailsText: claimDetails.warrantyDetailsText
      }
    });

  } catch (error) {
    console.error('Import Error:', error);
    res.status(500).json({ message: 'Failed to import email' });
  }
};