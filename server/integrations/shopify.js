import axios from 'axios';
import { transformOrder } from '../services/orderTransformer.js';
import Order from '../models/Order.js';

export const syncShopifyOrders = async (integration) => {
    const { storeUrl, accessToken } = integration.credentials;
    if (!storeUrl || !accessToken) throw new Error('Missing Shopify credentials');

    const cleanUrl = storeUrl.replace(/\/$/, '');
    const endpoint = `${cleanUrl}/admin/api/2023-10/orders.json?status=any&limit=50`;

    try {
        const response = await axios.get(endpoint, {
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            }
        });

        const orders = response.data.orders;
        const results = { synced: 0, duplicates: 0, errors: 0 };

        for (const rawOrder of orders) {
            try {
                const unified = transformOrder('shopify', rawOrder);
                await Order.create({
                    ...unified,
                    companyId: integration.companyId
                });
                results.synced++;
            } catch (err) {
                if (err.code === 11000) {
                    results.duplicates++;
                } else {
                    console.error('Shopify sync error for order:', rawOrder.id, err.message);
                    results.errors++;
                }
            }
        }

        return results;
    } catch (err) {
        console.error('Shopify API Error:', err.response?.data || err.message);
        throw err;
    }
};
