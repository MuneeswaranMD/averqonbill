import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import { transformOrder } from './services/orderTransformer.js';
import Order from './models/Order.js';
import Integration from './models/Integration.js';
import { verifyShopifyWebhook, verifyWooCommerceWebhook } from './integrations/security.js';
import { syncShopifyOrders } from './integrations/shopify.js';

dotenv.config();

// Fix for Node.js + MongoDB Atlas SRV resolution on some Windows environments
dns.setDefaultResultOrder('ipv4first');

const app = express();
app.use(cors());

// Middleware to capture raw body for webhook verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Connected (Averqonbill Cluster)'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const menuSchema = new mongoose.Schema({
  name: String,
  icon: String,
  moduleKey: String,
  category: String,
  isAccent: { type: Boolean, default: false }
});

const permissionSchema = new mongoose.Schema({
  companyId: String,
  allowedMenus: [String] // Array of moduleKeys
}, { timestamps: true });

const Menu = mongoose.model('Menu', menuSchema);
const Permission = mongoose.model('Permission', permissionSchema);

// --- Health Check ---
app.get('/health', (req, res) => res.status(200).send('OK'));

// --- API Endpoints ---

// Get all companies (for super admin)
app.get('/api/companies', async (req, res) => {
  try {
    // Note: Company model currently removed to favor simplified demo, 
    // but in real app we'd keep it. Using order logic as primary focus.
    res.json([]);
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

// Integration Management
app.post('/api/integrations', async (req, res) => {
  try {
    const int = await Integration.findOneAndUpdate(
      { companyId: req.body.companyId, platform: req.body.platform, storeName: req.body.storeName },
      req.body,
      { upsert: true, new: true }
    );
    res.status(201).json(int);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/integrations/:companyId', async (req, res) => {
  try {
    const ints = await Integration.find({ companyId: req.params.companyId });
    res.json(ints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/integrations/:id/sync', async (req, res) => {
  try {
    const int = await Integration.findById(req.params.id);
    if (!int) return res.status(404).send('Integration not found');

    let result;
    if (int.platform === 'shopify') {
      result = await syncShopifyOrders(int);
    } else {
      return res.status(400).send('Platform not supported for manual sync');
    }

    int.health.lastSync = new Date();
    await int.save();

    res.json({ success: true, ...result });
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

app.post('/api/webhook/:platform/:companyId', async (req, res) => {
    const { platform, companyId } = req.params;
    const payload = req.body;

    try {
        const integration = await Integration.findOne({ companyId, platform: platform });
        if (!integration) return res.status(404).send('Integration not found');

        // Security Verification
        if (platform === 'shopify') {
            const hmac = req.headers['x-shopify-hmac-sha256'];
            if (!verifyShopifyWebhook(req.rawBody, hmac, integration.webhookSecret)) {
                console.warn(`[Webhook] Invalid Shopify Signature for company: ${companyId}`);
                return res.status(401).send('Invalid Signature');
            }
        } else if (platform === 'woocommerce') {
            const signature = req.headers['x-wc-webhook-signature'];
            if (!verifyWooCommerceWebhook(req.rawBody, signature, integration.webhookSecret)) {
                console.warn(`[Webhook] Invalid WooCommerce Signature for company: ${companyId}`);
                console.log(`[Webhook Details] Signature: ${signature}, Secret: ${integration.webhookSecret}`);
                return res.status(401).send('Invalid Signature');
            }
        }

        const unifiedOrder = transformOrder(platform, payload);
        
        const newOrder = await Order.create({
            ...unifiedOrder,
            companyId
        });

        // Update Health
        integration.health.lastWebhook = new Date();
        await integration.save();

        res.status(201).json({ success: true, orderId: newOrder._id });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(200).json({ success: true, message: 'Duplicate order ignored' });
        }
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
