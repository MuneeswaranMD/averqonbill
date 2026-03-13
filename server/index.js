import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/saas_db';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Schemas ---

const companySchema = new mongoose.Schema({
  name: String,
  industry: String,
  ownerEmail: String,
  plan: { type: String, default: 'starter' },
  status: { type: String, default: 'active' }
}, { timestamps: true });

const integrationSchema = new mongoose.Schema({
  companyId: String, // Maps to Firestore companyId
  platformId: String, // shopify, woocommerce, etc.
  platformName: String,
  config: Object,
  webhookSecret: String,
  status: { type: String, default: 'active' }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  companyId: String,
  externalId: String,
  source: String,
  orderNumber: String,
  customerName: String,
  customerEmail: String,
  totalAmount: Number,
  currency: String,
  items: Array,
  shippingAddress: Object,
  paymentStatus: String,
  status: String,
  raw: Object
}, { timestamps: true });

const menuSchema = new mongoose.Schema({
  name: String,
  icon: String,
  moduleKey: String,
  category: String,
  isAccent: { type: Boolean, default: false }
});

const permissionSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  allowedMenus: [String] // Array of moduleKeys
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
const Integration = mongoose.model('Integration', integrationSchema);
const Order = mongoose.model('Order', orderSchema);
const Menu = mongoose.model('Menu', menuSchema);
const Permission = mongoose.model('Permission', permissionSchema);

// --- Utilities ---
const transformOrder = (platform, payload) => {
    // Simple version of the frontend transformer for the backend
    const map = {
        shopify: {
            externalId: payload.id?.toString(),
            source: 'Shopify',
            orderNumber: payload.name,
            customerName: `${payload.customer?.first_name || ''} ${payload.customer?.last_name || ''}`.trim(),
            totalAmount: payload.total_price
        },
        woocommerce: {
            externalId: payload.id?.toString(),
            source: 'WooCommerce',
            orderNumber: `#${payload.number}`,
            customerName: `${payload.billing?.first_name || ''} ${payload.billing?.last_name || ''}`.trim(),
            totalAmount: payload.total
        },
        custom: {
            externalId: payload.id || Date.now().toString(),
            source: payload.source || 'Custom API',
            orderNumber: payload.orderNumber,
            customerName: payload.customerName,
            totalAmount: payload.total
        }
    };
    return { ...map[platform], status: 'Received', raw: payload };
};

// --- API Endpoints ---

// Get all companies (for super admin)
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get menus allowed for a company
app.get('/api/company/:companyId/menus', async (req, res) => {
  try {
    const permission = await Permission.findOne({ companyId: req.params.companyId });
    if (!permission) {
      return res.json([]);
    }
    const menus = await Menu.find({ moduleKey: { $in: permission.allowedMenus } });
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save company menu permissions
app.post('/api/company/:companyId/menu-permissions', async (req, res) => {
  const { allowedMenus } = req.body;
  try {
    const permission = await Permission.findOneAndUpdate(
      { companyId: req.params.companyId },
      { allowedMenus },
      { upsert: true, new: true }
    );
    res.json({ message: 'Permissions saved successfully', permission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed Initial Menus
app.post('/api/seed-menus', async (req, res) => {
  const menus = [
    { name: 'Dashboard', icon: 'LayoutDashboard', moduleKey: 'Dashboard', category: 'Core' },
    { name: 'POS Terminal', icon: 'Zap', moduleKey: 'POS Billing', category: 'Sales', isAccent: true },
    { name: 'Products', icon: 'Package', moduleKey: 'Products', category: 'Core' },
    { name: 'Inventory', icon: 'Layers', moduleKey: 'Inventory', category: 'Core' },
    { name: 'Customers', icon: 'Users', moduleKey: 'Customers', category: 'CRM' },
    { name: 'Orders', icon: 'ShoppingCart', moduleKey: 'Orders', category: 'Sales' },
    { name: 'Invoices', icon: 'Receipt', moduleKey: 'Invoices', category: 'Finance' },
    { name: 'Reports', icon: 'BarChart3', moduleKey: 'Reports', category: 'Analytics' }
  ];
  try {
    await Menu.deleteMany({});
    await Menu.insertMany(menus);
    res.json({ message: 'Menus seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

// --- Integration Webhooks ---

app.post('/api/integrations/:platform/:companyId', async (req, res) => {
    const { platform, companyId } = req.params;
    const payload = req.body;

    console.log(`📦 Incoming ${platform} order for ${companyId}`);

    try {
        // 1. Verify Integration exists
        const integration = await Integration.findOne({ companyId, platformId: platform });
        if (!integration) {
            console.warn('❌ Integration not found');
            return res.status(404).send('Integration not found');
        }

        // 2. Transform to Unified Format
        const unifiedOrder = transformOrder(platform, payload);
        
        // 3. Save to MongoDB
        const newOrder = await Order.create({
            ...unifiedOrder,
            companyId
        });

        // 4. Trigger Automation (Simulated/Mocked)
        console.log(`⚡ Triggering automation for order ${newOrder.orderNumber}`);
        // await AutomationFetcher.trigger('ORDER_CREATED', newOrder);

        res.status(201).json({ success: true, orderId: newOrder._id });
    } catch (err) {
        console.error('❌ Webhook Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/orders/:companyId', async (req, res) => {
    try {
        const orders = await Order.find({ companyId: req.params.companyId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
