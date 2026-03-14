import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true, index: true },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true, index: true },
    quantity: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    available: { type: Number, default: 0 }, // quantity - reserved
    minLevel: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

InventorySchema.index({ variantId: 1, warehouseId: 1 }, { unique: true });

InventorySchema.pre('save', function(next) {
    this.available = (this.quantity || 0) - (this.reserved || 0);
    next();
});

export default mongoose.model('Inventory', InventorySchema);
