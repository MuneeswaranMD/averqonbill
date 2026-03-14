import mongoose from 'mongoose';

const WarehouseSchema = new mongoose.Schema({
    companyId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

export default mongoose.model('Warehouse', WarehouseSchema);
