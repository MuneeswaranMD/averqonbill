import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    companyId: { type: String, required: true, index: true },
    platform: String,
    externalId: String,
    name: { type: String, required: true },
    sku: String,
    description: String,
    price: { type: Number, default: 0 },
    compareAtPrice: Number,
    stock: { type: Number, default: 0 },
    category: String,
    images: [String],
    status: { type: String, default: 'active' },
    externalData: Object
}, { timestamps: true });

// Prevent duplicate products from same platform
ProductSchema.index({ companyId: 1, externalId: 1, platform: 1 }, { unique: true });

export default mongoose.model('Product', ProductSchema);
