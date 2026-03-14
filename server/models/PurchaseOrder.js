import mongoose from 'mongoose';

const PurchaseOrderSchema = new mongoose.Schema({
  companyId: { type: String, required: true, index: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  orderNumber: { type: String, required: true },
  items: [
    {
      variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant' },
      qty: { type: Number, required: true },
      price: { type: Number, required: true }, // Unit Price from Supplier
      receivedQty: { type: Number, default: 0 }
    }
  ],
  totalAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["draft", "ordered", "partially_received", "received", "cancelled"],
    default: "draft"
  },
  notes: String,
  orderDate: { type: Date, default: Date.now },
  receivedDate: Date
}, { timestamps: true });

PurchaseOrderSchema.index({ companyId: 1, orderNumber: 1 }, { unique: true });

export default mongoose.model('PurchaseOrder', PurchaseOrderSchema);
