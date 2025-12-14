import vision from '@google-cloud/vision';

let client;

try {
  if (process.env.GOOGLE_CLOUD_KEY_FILE) {
    client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
    });
  } else {
    // Will use default credentials from environment
    client = new vision.ImageAnnotatorClient();
  }
} catch (error) {
  console.warn('Vision client initialization warning:', error.message);
}

/**
 * Extract text from image file using Google Cloud Vision
 * @param {Buffer} imageBuffer - Image file buffer
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromImage = async (imageBuffer) => {
  try {
    if (!client) {
      console.warn('Vision client not available');
      return '';
    }

    // Prepare request for Vision API
    const request = {
      image: {
        content: imageBuffer
      }
    };

    // Call Vision API
    const [result] = await client.textDetection(request);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return '';
    }

    // Return full text (first annotation contains all text)
    return detections[0].description || '';
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error(`OCR extraction failed: ${error.message}`);
  }
};


