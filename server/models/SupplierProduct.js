import mongoose from 'mongoose';

const SupplierProductSchema = new mongoose.Schema({
  companyId: { type: String, required: true, index: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  supplierPrice: { type: Number, default: 0 },
  supplierSku: String,
  leadTimeDays: Number
}, { timestamps: true });

SupplierProductSchema.index({ supplierId: 1, productId: 1 }, { unique: true });

export default mongoose.model('SupplierProduct', SupplierProductSchema);
