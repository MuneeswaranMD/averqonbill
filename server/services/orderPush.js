import axios from 'axios';
import Integration from '../models/Integration.js';

export const pushOrderStatusToPlatform = async (companyId, orderId, newStatus) => {
    try {
        const Order = (await import('../models/Order.js')).default;
        const order = await Order.findById(orderId);
        if (!order || !order.externalId || !order.platform) return;

        const integration = await Integration.findOne({ 
            companyId, 
            platform: order.platform 
        });

        if (!integration) return;

        if (order.platform === 'shopify') {
            await updateShopifyOrder(integration, order.externalId, newStatus);
        } else if (order.platform === 'woocommerce') {
            await updateWooCommerceOrder(integration, order.externalId, newStatus);
        }
    } catch (err) {
        console.error(`[OrderPush] Failed for order ${orderId}:`, err.message);
    }
};

async function updateShopifyOrder(integration, externalId, status) {
    const { storeUrl, accessToken } = integration.credentials;
    const cleanUrl = storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`;
    
    // Mapping internal status to Shopify (Simplified)
    // Shopify orders are primarily managed via fulfillment or tags for status
    // For now, we'll add a tag to the order noting the Averqon status
    try {
        await axios.put(`${cleanUrl.replace(/\/$/, '')}/admin/api/2024-01/orders/${externalId}.json`, {
            order: {
                id: externalId,
                tags: `Averqon: ${status}`
            }
        }, {
            headers: { 'X-Shopify-Access-Token': accessToken }
        });
    } catch (err) {
        console.error(`[Shopify Order Update Error]`, err.message);
    }
}

async function updateWooCommerceOrder(integration, externalId, status) {
    const { storeUrl, consumerKey, consumerSecret } = integration.credentials;
    const cleanUrl = storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`;
    
    // Mapping internal status to WooCommerce
    let wcStatus = 'pending';
    if (status === 'Completed') wcStatus = 'completed';
    if (status === 'Cancelled') wcStatus = 'cancelled';
    if (status === 'Dispatched') wcStatus = 'completed'; // WC doesn't have dispatched by default
    if (status === 'Payment Received') wcStatus = 'processing';

    const endpoint = `${cleanUrl.replace(/\/$/, '')}/wp-json/wc/v3/orders/${externalId}`;

    try {
        await axios.put(endpoint, {
            status: wcStatus
        }, {
            auth: { username: consumerKey, password: consumerSecret }
        });
    } catch (err) {
        console.error(`[WooCommerce Order Update Error]`, err.message);
    }
}
