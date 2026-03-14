import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Variant from './models/Variant.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function checkDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const companyId = 'AVavcVj6JD7t4gTSrGs1'; // from logs
        
        const products = await Product.find({ companyId });
        console.log(`Products count for ${companyId}:`, products.length);
        if (products.length > 0) {
            console.log('Sample Product:', products[0].name, products[0]._id);
            const productIds = products.map(p => p._id);
            const variants = await Variant.find({ productId: { $in: productIds } });
            console.log(`Variants count:`, variants.length);
            if (variants.length > 0) {
                console.log('Sample Variant SKU:', variants[0].sku);
            }
        } else {
            const allProducts = await Product.countDocuments();
            console.log('Total Products in DB:', allProducts);
            const allVariants = await Variant.countDocuments();
            console.log('Total Variants in DB:', allVariants);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();
