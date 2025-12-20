// One-time script to fix existing bills with "Unknown" brand
// Run this if you have existing bills with brand = "Unknown" or "Unknown Brand"

import Bill from './src/config/Bill.js';
import mongoose from 'mongoose';

const fixExistingBrands = async () => {
    try {
        // Find all bills with Unknown brand
        const bills = await Bill.find({
            $or: [
                { brand: 'Unknown' },
                { brand: 'Unknown Brand' },
                { brand: { $exists: false } }
            ]
        });

        console.log(`Found ${bills.length} bills with unknown brands`);

        for (const bill of bills) {
            let newBrand = null;

            // Try to extract from keywords (first keyword)
            if (bill.keywords && bill.keywords.length > 0) {
                newBrand = bill.keywords[0];
                console.log(`  ${bill.productName}: Using keyword "${newBrand}"`);
            }
            // Fallback to first word of product name
            else if (bill.productName) {
                newBrand = bill.productName.trim().split(/\s+/)[0];
                console.log(`  ${bill.productName}: Using product name "${newBrand}"`);
            }

            if (newBrand) {
                bill.brand = newBrand;
                await bill.save();
            }
        }

        console.log('✅ Brand fix complete!');
    } catch (error) {
        console.error('Error fixing brands:', error);
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(async () => {
            await fixExistingBrands();
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
