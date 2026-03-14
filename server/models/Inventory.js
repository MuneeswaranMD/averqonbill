import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
    companyId: { type: String, required: true, index: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    quantity: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    minLevel: { type: Number, default: 5 }
}, { timestamps: true });

InventorySchema.index({ variantId: 1, warehouseId: 1 }, { unique: true });
InventorySchema.index({ companyId: 1 });


InventorySchema.pre('save', function(next) {
    this.available = (this.quantity || 0) - (this.reserved || 0);
    next();
});

export default mongoose.model('Inventory', InventorySchema);
