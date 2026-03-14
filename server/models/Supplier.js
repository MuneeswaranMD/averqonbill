import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema({
  companyId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  contactPerson: String,
  phone: String,
  email: String,
  gstNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  notes: String,
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
}, { timestamps: true });

SupplierSchema.index({ companyId: 1, name: 1 }, { unique: true });

export default mongoose.model('Supplier', SupplierSchema);
