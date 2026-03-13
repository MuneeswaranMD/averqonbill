import axios from 'axios';
import mongoose from 'mongoose';
import Integration from '../models/Integration.js';

export const pushInventoryToPlatform = async (companyId, productId, newStock) => {
    try {
        const product = await mongoose.model('Product').findById(productId);
        if (!product || !product.externalId || !product.platform) return;

        const integration = await Integration.findOne({ 
            companyId, 
            platform: product.platform 
        });

        if (!integration) return;

        if (product.platform === 'shopify') {
            await pushToShopify(integration, product, newStock);
        } else if (product.platform === 'woocommerce') {
            await pushToWooCommerce(integration, product.externalId, newStock);
        }
    } catch (err) {
        console.error(`[InventoryPush] Failed for product ${productId}:`, err.message);
    }
};

async function pushToShopify(integration, product, newStock) {
    const { storeUrl, accessToken } = integration.credentials;
    const cleanUrl = storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`;
    
    // Shopify inventory update requires location_id and inventory_item_id
    const inventoryItemId = product.externalData?.variants?.[0]?.inventory_item_id;
    if (!inventoryItemId) {
        console.warn(`[Shopify Push] No inventory_item_id found for product ${product._id}`);
        return;
    }

    try {
        // 1. Get locations
        const locResponse = await axios.get(`${cleanUrl.replace(/\/$/, '')}/admin/api/2024-01/locations.json`, {
            headers: { 'X-Shopify-Access-Token': accessToken }
        });
        const locationId = locResponse.data.locations?.[0]?.id;

        if (!locationId) throw new Error('No Shopify location found');

        // 2. Set inventory level
        await axios.post(`${cleanUrl.replace(/\/$/, '')}/admin/api/2024-01/inventory_levels/set.json`, {
            location_id: locationId,
            inventory_item_id: inventoryItemId,
            available: newStock
        }, {
            headers: { 'X-Shopify-Access-Token': accessToken }
        });

        console.log(`[Shopify Push] Updated stock for ${product.name} to ${newStock}`);
    } catch (err) {
        console.error(`[Shopify Push Error]`, err.response?.data || err.message);
    }
}

async function pushToWooCommerce(integration, externalId, newStock) {
    const { storeUrl, consumerKey, consumerSecret } = integration.credentials;
    const cleanUrl = storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`;
    const endpoint = `${cleanUrl.replace(/\/$/, '')}/wp-json/wc/v3/products/${externalId}`;

    await axios.put(endpoint, {
        stock_quantity: newStock
    }, {
        auth: { username: consumerKey, password: consumerSecret }
    });
}
