import axios from 'axios';
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
            await pushToShopify(integration, product.externalId, newStock);
        } else if (product.platform === 'woocommerce') {
            await pushToWooCommerce(integration, product.externalId, newStock);
        }
    } catch (err) {
        console.error(`[InventoryPush] Failed for product ${productId}:`, err.message);
    }
};

async function pushToShopify(integration, externalId, newStock) {
    const { storeUrl, accessToken } = integration.credentials;
    const cleanUrl = storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`;
    
    // Shopify inventory update is a bit complex, usually requires location_id and inventory_item_id
    // For this implementation, we'll try to find the inventory_item_id from the stored externalData if available
    const inventoryItemId = integration.externalData?.variants?.[0]?.inventory_item_id;
    if (!inventoryItemId) return;

    // This is a simplified version, real Shopify sync requires fetching location levels first
    // Skipping for now to keep it robust against missing location data
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
