import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    productName: {
      type: String,
      required: true,
      trim: true
    },
    purchaseDate: {
      type: Date,
      required: true
    },
    warrantyYears: {
      type: Number,
      required: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    purchasePrice: {
      type: Number,
      default: 0
    },
    keywords: {
      type: [String],
      default: []
    },
    storeName: {
      type: String,
      trim: true
    },
    billImageUrl: {
      type: String, // URL from Supabase Storage
      required: true
    },
    source: {
      type: String,
      enum: ['upload', 'gmail'],
      default: 'upload'
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'expired'],
      default: 'pending'
    },
    reminderDaysBefore: {
      type: Number,
      default: 30
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
    emailSource: {
      type: String
    },
    // Claim details from OCR
    brand: {
      type: String,
      default: 'Unknown'
    },
    storeEmail: String,
    storePhone: String,
    warrantyDetailsText: String
  },
  {
    timestamps: true
  }
);

const Bill = mongoose.model('Bill', billSchema);

export default Bill;
