import mongoose from 'mongoose';


const VariantSchema = new mongoose.Schema({
    companyId: { type: String, required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },

    sku: { type: String, required: true },
    price: { type: Number, default: 0 },
    comparePrice: Number,
    costPrice: { type: Number, default: 0 }, // For PO calculations
    weight: Number,
    options: {
        size: String,
        color: String,
        material: String,
        flavour: String // Sparkle/Color etc for Crackers
    },
    platformVariantId: String,
    inventoryItemId: String, // Shopify specific
    barcode: String
}, { timestamps: true });

VariantSchema.index({ sku: 1 }, { unique: true });

export default mongoose.model('Variant', VariantSchema);
