import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    password: {
      type: String,
      required: false // Optional now because Supabase handles auth
    },
    fullName: {
      type: String,
      trim: true
    },
    profileImage: {
      type: String
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

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
