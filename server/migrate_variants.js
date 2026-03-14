import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Variant from './models/Variant.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const companyId = 'AVavcVj6JD7t4gTSrGs1'; // from logs
        const products = await Product.find({ companyId });
        console.log(`Found ${products.length} products to check.`);

        for (const product of products) {
            const variantExists = await Variant.findOne({ productId: product._id });
            if (!variantExists) {
                console.log(`Creating variant for: ${product.name}`);
                await Variant.create({
                    companyId: product.companyId,
                    productId: product._id,
                    sku: product.sku || `MIG-${product._id}`,
                    price: product.price || 0,
                    costPrice: 0,
                    status: 'active'
                });
            }
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
