import axios from 'axios';

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const SERPER_API_URL = "https://google.serper.dev/search";

/**
 * Search for warranty claim links using Serper.dev API
 * @param {Object} billData - Bill information
 * @param {string} billData.productName - Product name
 * @param {string} billData.brand - Product brand
 * @param {string} billData.storeName - Store name
 * @returns {Promise<Array>} - Array of categorized warranty claim links
 */
export const searchClaimLinks = async ({ productName, brand, storeName }) => {
    if (!SERPER_API_KEY) {
        throw new Error("SERPER_API_KEY is not configured");
    }

    try {
        // Generate smart search queries
        const brandName = brand && brand !== "Unknown Brand" ? brand : extractBrandFromProduct(productName);

        console.log("Brand Name:", brandName);
        console.log("Product Name:", productName);
        console.log("Store Name:", storeName);
        
        const searchQueries = [
            `${brandName} warranty claim process`,
            `${brandName} customer support warranty registration`,
            `${brandName} service center warranty`
        ];

        // Execute search (using first query for now, can combine results later)
        const response = await axios.post(
            SERPER_API_URL,
            {
                q: searchQueries[0],
                num: 10 // Get top 10 results
            },
            {
                headers: {
                    "X-API-KEY": SERPER_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        // Parse and categorize results
        const results = response.data.organic || [];
        const categorizedLinks = categorizeLinks(results, brandName);

        return categorizedLinks;
    } catch (error) {
        console.error("Error searching for warranty claim links:", error.message);
        throw new Error("Failed to search for warranty claim links");
    }
};

/**
 * Extract brand name from product name (simple heuristic)
 */
const extractBrandFromProduct = (productName) => {
    // Common pattern: "Brand Model Description"
    // Take first word as brand
    const words = productName.trim().split(/\s+/);
    return words[0] || productName;
};

/**
 * Categorize search results into different types
 */
const categorizeLinks = (results, brandName) => {
    const categorized = {
        officialSupport: [],
        serviceCenters: [],
        registration: [],
        guides: []
    };

    const brandLower = brandName.toLowerCase();

    results.forEach((result) => {
        const link = result.link || "";
        const title = result.title || "";
        const snippet = result.snippet || "";
        const linkLower = link.toLowerCase();
        const titleLower = title.toLowerCase();

        // Create link object
        const linkObj = {
            title: result.title,
            url: result.link,
            description: result.snippet
        };

        // Categorization logic
        // Official Support - Official brand websites
        if (
            linkLower.includes(brandLower) &&
            (linkLower.includes(".com") || linkLower.includes(".in")) &&
            (titleLower.includes("support") ||
                titleLower.includes("warranty") ||
                titleLower.includes("customer care"))
        ) {
            categorized.officialSupport.push(linkObj);
        }
        // Service Centers
        else if (
            titleLower.includes("service center") ||
            titleLower.includes("repair") ||
            titleLower.includes("locate") ||
            snippet.toLowerCase().includes("service center")
        ) {
            categorized.serviceCenters.push(linkObj);
        }
        // Registration
        else if (
            titleLower.includes("register") ||
            titleLower.includes("registration") ||
            snippet.toLowerCase().includes("register your product")
        ) {
            categorized.registration.push(linkObj);
        }
        // Guides and How-tos
        else if (
            titleLower.includes("how to") ||
            titleLower.includes("guide") ||
            titleLower.includes("claim") ||
            titleLower.includes("warranty")
        ) {
            categorized.guides.push(linkObj);
        }
        // Default to guides if no specific category
        else {
            categorized.guides.push(linkObj);
        }
    });

    // Limit results per category
    return {
        officialSupport: categorized.officialSupport.slice(0, 3),
        serviceCenters: categorized.serviceCenters.slice(0, 3),
        registration: categorized.registration.slice(0, 2),
        guides: categorized.guides.slice(0, 4)
    };
};

