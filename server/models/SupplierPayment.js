import mongoose from 'mongoose';

const SupplierPaymentSchema = new mongoose.Schema({
  companyId: { type: String, required: true, index: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit'], 
    default: 'Cash' 
  },
  referenceNumber: String,
  paidAt: { type: Date, default: Date.now },
  notes: String
}, { timestamps: true });

export default mongoose.model('SupplierPayment', SupplierPaymentSchema);
