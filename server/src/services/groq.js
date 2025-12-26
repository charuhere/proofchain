import Groq from 'groq-sdk';

let groq;

try {
  if (process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
} catch (error) {
  console.warn('Groq client initialization warning:', error.message);
}

/**
 * Safely parse JSON from AI response (handles markdown code blocks)
 */
const safeJSONParse = (text) => {
  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse AI JSON:", text);
    return null;
  }
};

/**
 * Generic Groq API caller - reduces code duplication across extraction functions
 * 
 * @param {string} systemPrompt - System role instructions
 * @param {string} userPrompt - User prompt with data to analyze
 * @param {any} defaultValue - Fallback value if API fails
 * @param {number} temperature - AI temperature (0.1 = precise, 0.3+ = creative)
 * @returns {Promise<any>} - Parsed JSON response or default value
 */
const callGroq = async (systemPrompt, userPrompt, defaultValue, temperature = 0.1) => {
  if (!groq) return defaultValue;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
    });
    return safeJSONParse(response.choices[0]?.message?.content) || defaultValue;
  } catch (error) {
    console.error('Groq API Error:', error.message);
    return defaultValue;
  }
};

/**
 * Extract product information from bill/receipt text
 */
export const extractProductInfo = async (billText) => {
  return callGroq(
    'You are a JSON-only API. Extract product data from receipts.',
    `Extract product information from this bill text. 
Return strictly valid JSON with these fields: productName, price (number), store, itemCount.
If a field is not found, use reasonable defaults or null.

Bill text:
${billText}`,
    { price: 0, store: 'Unknown' }
  );
};

/**
 * Generate search keywords for a product based on bill context
 */
export const generateKeywords = async (billText, productName) => {
  const result = await callGroq(
    'You are a JSON-only API. Generate SEO keywords.',
    `Generate 5-10 relevant search keywords for this product based on the text.
Include category, brand, and key features.

Product: ${productName}
Bill Context: ${billText.substring(0, 500)}

Return format strictly: {"keywords": ["keyword1", "keyword2", ...]}`,
    { keywords: [productName.toLowerCase()] },
    0.3
  );
  return result?.keywords || [productName.toLowerCase()];
};

/**
 * Extract warranty claim details (brand, store contact info)
 */
export const extractClaimDetails = async (billText) => {
  const result = await callGroq(
    'You are a JSON-only API. Extract warranty claim details from receipts/invoices.',
    `Extract warranty claim details from this bill/email text.
Return strictly valid JSON with these fields: brand (product brand/manufacturer), storeEmail (store email if present), storePhone (store phone if present), warrantyDetailsText (any warranty text found, limit to 200 chars).
If a field is not found, use empty string or null.

Bill text:
${billText}`,
    { brand: 'Unknown Brand', storeEmail: '', storePhone: '', warrantyDetailsText: '' }
  );
  return {
    brand: result?.brand || 'Unknown Brand',
    storeEmail: result?.storeEmail || '',
    storePhone: result?.storePhone || '',
    warrantyDetailsText: result?.warrantyDetailsText || ''
  };
};
