import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    supabaseUid: {
      type: String,
      unique: true,
      sparse: true // Allow null/undefined for existing users initially
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    fullName: {
      type: String,
      trim: true
    },
    gmailConnected: {
      type: Boolean,
      default: false
    },
    gmailAccessToken: {
      type: String // Store encrypted
    },
    gmailRefreshToken: {
      type: String // Store encrypted
    },
    lastEmailScanDate: {
      type: Date
    },
    reminderPreference: {
      type: String,
      enum: ['email', 'sms', 'both'],
      default: 'email'
    },
    phoneNumber: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);



const User = mongoose.model('User', userSchema);

export default User;
