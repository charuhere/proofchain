import axios from 'axios';
import Bill from '../config/Bill.js';
import User from '../config/User.js';

// Brevo API endpoint
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send warranty expiry reminder email via Brevo REST API
 */
export const sendExpiryReminder = async (userId, bill) => {
  try {
    // Get user details
    const user = await User.findById(userId);

    if (!user || !user.email) {
      console.log('User email not found, skipping reminder');
      return false;
    }

    // Calculate days until expiry
    const today = new Date();
    const expiry = new Date(bill.expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    // Build email HTML
    const htmlContent = generateReminderHTML(bill, daysLeft, user.email);

    // Send email via Brevo REST API
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          name: process.env.BREVO_SENDER_NAME || 'ProofChain',
          email: process.env.BREVO_SENDER_EMAIL
        },
        to: [
          {
            email: user.email,
            name: user.email.split('@')[0]
          }
        ],
        subject: `⚠️ Warranty Expiring Soon - ${bill.productName}`,
        htmlContent: htmlContent
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Mark reminder as sent
    await Bill.findByIdAndUpdate(bill._id, { reminderSent: true }, { new: true });

    console.log(
      `✓ Warranty reminder sent to ${user.email} for ${bill.productName} (Message ID: ${response.data.messageId})`
    );
    return true;
  } catch (error) {
    console.error('Error sending warranty reminder:', error.response?.data || error.message);
    return false;
  }
};

/**
 * Check and send reminders for expiring warranties
 * Runs daily via cron job
 */
export const checkAndSendReminders = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Running warranty reminder check...`);

    // Get all users
    const users = await User.find({ email: { $exists: true } });

    let sentCount = 0;
    for (const user of users) {
      // Find bills expiring in the next N days that haven't been reminded
      const bills = await Bill.find({
        userId: user._id,
        status: { $in: ['verified', 'pending'] },
        reminderSent: false,
        expiryDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
        }
      });

      // Send reminders for each bill
      for (const bill of bills) {
        const daysLeft = Math.ceil(
          (new Date(bill.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
        );

        // Only send if expiring within the reminder period
        if (daysLeft <= bill.reminderDaysBefore && daysLeft > 0) {
          const sent = await sendExpiryReminder(user._id, bill);
          if (sent) sentCount++;
        }
      }
    }

    console.log(
      `[${new Date().toISOString()}] Warranty reminder check completed. Sent ${sentCount} reminder(s).`
    );
  } catch (error) {
    console.error('Error in warranty reminder check:', error);
  }
};

/**
 * Generate HTML email template for warranty expiry reminder
 */
function generateReminderHTML(bill, daysLeft, userEmail) {
  const expiryDate = new Date(bill.expiryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const purchaseDate = new Date(bill.purchaseDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const statusColor =
    daysLeft <= 0 ? '#dc2626' : daysLeft <= 30 ? '#ea580c' : '#16a34a';
  const statusBg =
    daysLeft <= 0 ? '#fee2e2' : daysLeft <= 30 ? '#fed7aa' : '#dcfce7';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px 20px;
    }
    .alert-box {
      background: ${statusBg};
      border-left: 4px solid ${statusColor};
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .alert-box .status {
      color: ${statusColor};
      font-weight: 700;
      font-size: 16px;
      margin: 0 0 5px 0;
    }
    .product-details {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #666;
    }
    .detail-value {
      color: #333;
      font-weight: 500;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #eee;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .claim-info {
      background: #e0e7ff;
      border: 1px solid #a5b4fc;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      font-size: 14px;
    }
    .claim-info strong {
      color: #4f46e5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Warranty Expiring Soon</h1>
    </div>

    <div class="content">
      <p>Hi there,</p>
      <p>Your warranty for <strong>${bill.productName}</strong> is about to expire!</p>

      <div class="alert-box">
        <p class="status">
          ${daysLeft > 0 ? `⏰ ${daysLeft} days remaining` : '❌ Already expired'}
        </p>
        <p style="margin: 0; font-size: 14px;">
          Expiry date: <strong>${expiryDate}</strong>
        </p>
      </div>

      <div class="product-details">
        <div class="detail-row">
          <span class="detail-label">Product</span>
          <span class="detail-value">${bill.productName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Purchase Date</span>
          <span class="detail-value">${purchaseDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Warranty Expiry</span>
          <span class="detail-value" style="color: ${statusColor}; font-weight: 700;">${expiryDate}</span>
        </div>
        ${bill.purchasePrice > 0 ? `
        <div class="detail-row">
          <span class="detail-label">Purchase Price</span>
          <span class="detail-value">₹${bill.purchasePrice.toFixed(2)}</span>
        </div>
        ` : ''}
        ${bill.storeName ? `
        <div class="detail-row">
          <span class="detail-label">Store</span>
          <span class="detail-value">${bill.storeName}</span>
        </div>
        ` : ''}
      </div>

      ${bill.storeEmail || bill.storePhone ? `
      <div class="claim-info">
        <strong>💡 Warranty Claim Information:</strong><br>
        ${bill.storeEmail ? `Email: <a href="mailto:${bill.storeEmail}">${bill.storeEmail}</a><br>` : ''}
        ${bill.storePhone ? `Phone: <a href="tel:${bill.storePhone}">${bill.storePhone}</a>` : ''}
      </div>
      ` : ''}

      <p style="text-align: center;">
        <a href="http://localhost:3002/dashboard" class="cta-button">View in ProofChain</a>
      </p>

      <p style="color: #666; font-size: 14px;">
        <strong>Pro Tip:</strong> Keep your warranty documents safe. Some warranties require you to file a claim before the expiry date to receive coverage.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        © 2025 ProofChain. All rights reserved.
      </p>
      <p style="margin: 0;">
        <a href="http://localhost:3002">Visit ProofChain</a> |
        <a href="http://localhost:3002/dashboard">My Dashboard</a>
      </p>
      <p style="margin: 10px 0 0 0; font-size: 11px; color: #999;">
        This email was sent to ${userEmail}
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
