import axios from 'axios';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import { transformOrder } from '../services/orderTransformer.js';

import { transformProduct } from '../services/productTransformer.js';
import { updateStockFromOrder } from '../services/stockService.js';

export const syncWooCommerceOrders = async (integration) => {
    const { storeUrl, consumerKey, consumerSecret } = integration.credentials;
    const cleanUrl = storeUrl ? (storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`) : '';
    if (!cleanUrl) throw new Error('Invalid WooCommerce Store URL');
    const endpoint = `${cleanUrl.replace(/\/$/, '')}/wp-json/wc/v3/orders?per_page=50`;

    try {
        const response = await axios.get(endpoint, {
            auth: { username: consumerKey, password: consumerSecret }
        });

        const orders = response.data;
        const results = { synced: 0, duplicates: 0, errors: 0 };

        for (const rawOrder of orders) {
            try {
                const unified = transformOrder('woocommerce', rawOrder);
                const newOrder = await Order.create({ ...unified, companyId: integration.companyId });
                
                // --- Automatic Stock Updates ---
                await updateStockFromOrder(integration.companyId, newOrder);

                results.synced++;
            } catch (err) {
                if (err.code === 11000) results.duplicates++;
                else results.errors++;
            }
        }
        return results;
    } catch (err) {
        throw new Error(`WooCommerce Order Sync Error: ${err.response?.statusText || err.message}`);
    }
};

export const syncWooCommerceProducts = async (integration) => {
    const { storeUrl, consumerKey, consumerSecret } = integration.credentials;
    const cleanUrl = storeUrl ? (storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`) : '';
    if (!cleanUrl) throw new Error('Invalid WooCommerce Store URL');
    const endpoint = `${cleanUrl.replace(/\/$/, '')}/wp-json/wc/v3/products?per_page=50`;

    try {
        const response = await axios.get(endpoint, {
            auth: { username: consumerKey, password: consumerSecret }
        });

        const products = response.data;
        const results = { synced: 0, duplicates: 0, errors: 0 };

        for (const rawProd of products) {
            try {
                const unified = transformProduct('woocommerce', rawProd);
                const product = await Product.findOneAndUpdate(
                    { companyId: integration.companyId, externalId: unified.externalId, platform: 'woocommerce' },
                    { ...unified, companyId: integration.companyId },
                    { upsert: true, new: true }
                );

                // Ensure at least one variant exists for the product
                await Variant.findOneAndUpdate(
                    { companyId: integration.companyId, sku: product.sku || `WC-${product.externalId}` },
                    {
                        companyId: integration.companyId,
                        productId: product._id,
                        sku: product.sku || `WC-${product.externalId}`,
                        price: product.price,
                        costPrice: 0,
                    },
                    { upsert: true }
                );

                results.synced++;

            } catch (err) {
                results.errors++;
            }
        }
        return results;
    } catch (err) {
        console.error('WooCommerce Sync Exception:', err.response?.data || err.message);
        throw new Error(`WooCommerce Product Sync Error: ${err.response?.statusText || err.message}`);
    }
};
