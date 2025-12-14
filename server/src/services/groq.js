import Groq from 'groq-sdk';

let groq;

try {
  if (process.env.GROQ_API_KEY) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
} catch (error) {
  console.warn('Groq client initialization warning:', error.message);
}

/**
 * Helper to safely parse JSON from AI response
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
 * Extract product information from bill text
 */
export const extractProductInfo = async (billText) => {
  try {
    if (!groq) return { price: 0, store: 'Unknown' };

    const response = await groq.chat.completions.create({
      // UPDATED MODEL HERE
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only API. You extract product data from receipts.'
        },
        {
          role: 'user',
          content: `Extract product information from this bill text. 
Return strictly valid JSON with these fields: productName, price (number), store, itemCount.
If a field is not found, use reasonable defaults or null.

Bill text:
${billText}
`
        }
      ],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '{}';
    return safeJSONParse(content) || { price: 0, store: 'Unknown' };

  } catch (error) {
    console.error('Groq Product Info Error:', error.message);
    return { productName: "Unidentified Item", price: 0, store: 'Unknown' };
  }
};

/**
 * Generate keywords for bill based on product and features
 */
export const generateKeywords = async (billText, productName) => {
  try {
    if (!groq) return [productName.toLowerCase()];

    const response = await groq.chat.completions.create({
      // UPDATED MODEL HERE
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only API. Generate SEO keywords.'
        },
        {
          role: 'user',
          content: `Generate 5-10 relevant search keywords for this product based on the text.
Include category, brand, and key features.

Product: ${productName}
Bill Context: ${billText.substring(0, 500)}

Return format strictly: {"keywords": ["keyword1", "keyword2", ...]}
`
        }
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '{"keywords": []}';
    const parsed = safeJSONParse(content);

    return parsed?.keywords || [productName.toLowerCase()];

  } catch (error) {
    console.error('Groq Keyword Gen Error:', error.message);
    return [productName.toLowerCase()];
  }
};



/**
 * Extract warranty claim details (brand, store contact, warranty details)
 */
export const extractClaimDetails = async (billText) => {
  try {
    if (!groq) return { brand: 'Unknown', storeEmail: '', storePhone: '', warrantyDetailsText: '' };

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only API. Extract warranty claim details from receipts/invoices.'
        },
        {
          role: 'user',
          content: `Extract warranty claim details from this bill/email text.
Return strictly valid JSON with these fields: brand (product brand/manufacturer), storeEmail (store email if present), storePhone (store phone if present), warrantyDetailsText (any warranty text found, limit to 200 chars).
If a field is not found, use empty string or null.

Bill text:
${billText}`
        }
      ],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = safeJSONParse(content);
    return {
      brand: result?.brand || 'Unknown Brand',
      storeEmail: result?.storeEmail || '',
      storePhone: result?.storePhone || '',
      warrantyDetailsText: result?.warrantyDetailsText || ''
    };

  } catch (error) {
    console.error('Groq Claim Details Error:', error.message);
    return { brand: 'Unknown', storeEmail: '', storePhone: '', warrantyDetailsText: '' };
  }
};

