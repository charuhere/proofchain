import supabase from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload bill image to Supabase Storage
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} originalName - Original filename
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export const uploadBillImage = async (fileBuffer, originalName, userId) => {
  try {
    const fileName = `${userId}/${uuidv4()}_${originalName.replace(/\s+/g, '_')}`;
    
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET || 'bills')
      .upload(fileName, fileBuffer, {
        contentType: 'application/octet-stream',
        upsert: false
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(process.env.SUPABASE_BUCKET || 'bills')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Upload Error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Delete bill image from Supabase Storage
 * @param {string} fileUrl - Public URL of file
 * @returns {Promise<void>}
 */
export const deleteBillImage = async (fileUrl) => {
  try {
    // Extract path from URL
    const urlParts = fileUrl.split('/');
    const filePath = urlParts.slice(-2).join('/');

    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET || 'bills')
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
    }
  } catch (error) {
    console.error('Delete Error:', error);
  }
};
