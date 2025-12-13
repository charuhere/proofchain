import Bill from '../config/Bill.js';
import { uploadBillImage, deleteBillImage } from '../services/supabase.js';
import { extractTextFromImage } from '../services/ocr.js';
import { extractProductInfo, generateKeywords, extractClaimDetails } from '../services/groq.js';

/**
 * Upload Bill - Initial step
 * User enters product details first
 */
export const uploadBill = async (req, res) => {
  try {
    const { productName, purchaseDate, warrantyYears } = req.body;

    // Validation
    if (!productName || !purchaseDate || !warrantyYears || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Product name, purchase date, warranty years, and file are required'
      });
    }

    // Calculate expiry date
    const purchase = new Date(purchaseDate);
    const expiry = new Date(purchase);
    expiry.setFullYear(expiry.getFullYear() + parseInt(warrantyYears));

    // Upload image to Supabase
    const billImageUrl = await uploadBillImage(
      req.file.buffer,
      req.file.originalname,
      req.userId
    );

    // Extract text from image using Google Cloud Vision
    const extractedText = await extractTextFromImage(req.file.buffer);

    // Process text with Groq to get product info, keywords, and claim details
    let productInfo = { price: 0, store: 'Unknown' };
    let keywords = [];
    let claimDetails = { brand: 'Unknown', storeEmail: '', storePhone: '', warrantyDetailsText: '' };

    if (extractedText) {
      try {
        productInfo = await extractProductInfo(extractedText);
        keywords = await generateKeywords(extractedText, productName);
        claimDetails = await extractClaimDetails(extractedText);
      } catch (error) {
        console.error('Error processing with Groq:', error);
        // Continue without Groq processing if it fails
      }
    }

    // Create bill document
    const newBill = new Bill({
      userId: req.userId,
      productName,
      purchaseDate: purchase,
      warrantyYears,
      expiryDate: expiry,
      purchasePrice: productInfo.price || 0,
      keywords: keywords || [],
      storeName: productInfo.store || 'Unknown',
      billImageUrl,
      status: 'verified',
      // Warranty claim details
      brand: claimDetails.brand,
      storeEmail: claimDetails.storeEmail,
      storePhone: claimDetails.storePhone,
      warrantyDetailsText: claimDetails.warrantyDetailsText
    });

    await newBill.save();

    res.status(201).json({
      success: true,
      message: 'Bill uploaded successfully',
      data: newBill
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload bill',
      error: error.message
    });
  }
};

/**
 * Get All Bills for User
 */
export const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.userId }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills',
      error: error.message
    });
  }
};

/**
 * Get Single Bill
 */
export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findOne({
      _id: id,
      userId: req.userId
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bill',
      error: error.message
    });
  }
};

/**
 * Update Bill - status, expiry date, reminder settings
 */
export const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reminderDaysBefore, expiryDate } = req.body;

    // --- DEBUG LOGS ---
    console.log("--------------------------------");
    console.log("PATCH REQUEST RECEIVED");
    console.log("Bill ID from URL:", id);
    console.log("User ID from Token:", req.userId);
    console.log("Body Data:", req.body);
    // ------------------

    const updateData = {};
    if (status) updateData.status = status;
    if (reminderDaysBefore !== undefined && reminderDaysBefore !== null) {
      updateData.reminderDaysBefore = reminderDaysBefore;
    }
    if (expiryDate) {
      updateData.expiryDate = new Date(expiryDate);
      updateData.reminderSent = false;
    }

    const bill = await Bill.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updateData,
      { new: true }
    );

    if (!bill) {
      console.log("ERROR: Bill not found in DB for this user.");
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    console.log("SUCCESS: Bill updated!");
    res.status(200).json({
      success: true,
      message: 'Bill updated successfully',
      data: bill
    });
  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bill',
      error: error.message
    });
  }
};

/**
 * Delete Bill
 */
export const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Delete from Supabase Storage
    await deleteBillImage(bill.billImageUrl);

    res.status(200).json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete bill',
      error: error.message
    });
  }
};

/**
 * Search Bills by Keywords
 */
export const searchBills = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const bills = await Bill.find({
      userId: req.userId,
      $or: [
        { productName: { $regex: query, $options: 'i' } },
        { storeName: { $regex: query, $options: 'i' } },
        { keywords: { $regex: query, $options: 'i' } }
      ]
    });

    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

/**
 * Get Bills Expiring Soon
 */
export const getBillsExpiringsoon = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const bills = await Bill.find({
      userId: req.userId,
      expiryDate: {
        $gte: today,
        $lte: futureDate
      },
      status: { $ne: 'expired' }
    }).sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills',
      error: error.message
    });
  }
};

/**
 * Create Bill - Direct creation from JSON data (e.g., from Gmail import)
 */
export const createBill = async (req, res) => {
  try {
    const {
      productName,
      storeName,
      purchasePrice,
      purchaseDate,
      expiryDate,
      billImageUrl,
      keywords,
      warrantyYears,
      reminderDaysBefore
    } = req.body;

    // Validation
    if (!productName || !purchaseDate) {
      return res.status(400).json({
        success: false,
        message: 'Product name and purchase date are required'
      });
    }

    // Calculate expiry date if not provided
    let finalExpiryDate = expiryDate;
    if (!finalExpiryDate) {
      const purchase = new Date(purchaseDate);
      const expiry = new Date(purchase);
      const years = warrantyYears || 1;
      expiry.setFullYear(expiry.getFullYear() + years);
      finalExpiryDate = expiry;
    }

    // Create bill
    const newBill = new Bill({
      userId: req.userId,
      productName,
      storeName: storeName || 'Unknown Store',
      purchaseDate,
      expiryDate: finalExpiryDate,
      purchasePrice: purchasePrice || 0,
      billImageUrl: billImageUrl || null,
      keywords: keywords || [],
      warrantyYears: warrantyYears || 1,
      reminderDaysBefore: reminderDaysBefore || 30,
      status: 'verified' // Gmail imports are verified
    });

    await newBill.save();

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      bill: newBill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create bill',
      error: error.message
    });
  }
};
