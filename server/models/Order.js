import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    companyId: { type: String, required: true, index: true },
    
    // Flattened primary fields (for UI and search)
    externalId: String,
    source: String,
    orderNumber: String,
    customerName: String,
    customerEmail: String,
    totalAmount: Number,
    paymentStatus: String,
    platform: String,

    // Structured fields (for deep logic)
    external: {
        orderId: { type: String, index: true },
        rawData: Object
    },
    customer: Object,
    items: Array,
    pricing: Object,
    payment: Object,

    status: { type: String, default: 'new' },
}, { timestamps: true });

// Prevent duplicate orders
OrderSchema.index({ companyId: 1, externalId: 1, platform: 1 }, { unique: true });

export default mongoose.model('Order', OrderSchema);
