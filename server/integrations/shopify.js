import axios from 'axios';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import { transformOrder } from '../services/orderTransformer.js';

import { transformProduct } from '../services/productTransformer.js';
import { updateStockFromOrder } from '../services/stockService.js';

export const syncShopifyOrders = async (integration) => {
    const { storeUrl, accessToken } = integration.credentials;
    if (!storeUrl || !accessToken) throw new Error('Missing Shopify credentials');

    const cleanUrl = storeUrl ? (storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`) : '';
    if (!cleanUrl) throw new Error('Invalid Shopify Store URL');
    const endpoint = `${cleanUrl.replace(/\/$/, '')}/admin/api/2023-10/orders.json?status=any&limit=50`;

    try {
        const response = await axios.get(endpoint, {
            headers: { 'X-Shopify-Access-Token': accessToken }
        });

        const orders = response.data.orders;
        const results = { synced: 0, duplicates: 0, errors: 0 };

        for (const rawOrder of orders) {
            try {
                const unified = transformOrder('shopify', rawOrder);
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
        throw new Error(`Shopify API Error: ${err.response?.statusText || err.message}`);
    }
};

export const syncShopifyProducts = async (integration) => {
    const { storeUrl, accessToken } = integration.credentials;
    if (!storeUrl || !accessToken) throw new Error('Missing Shopify credentials');

    const cleanUrl = storeUrl ? (storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`) : '';
    if (!cleanUrl) throw new Error('Invalid Shopify Store URL');
    const endpoint = `${cleanUrl.replace(/\/$/, '')}/admin/api/2023-10/products.json?limit=50`;

    try {
        const response = await axios.get(endpoint, {
            headers: { 'X-Shopify-Access-Token': accessToken }
        });

        const products = response.data.products;
        const results = { synced: 0, duplicates: 0, errors: 0 };

        for (const rawProd of products) {
            try {
                const unified = transformProduct('shopify', rawProd);
                const product = await Product.findOneAndUpdate(
                    { companyId: integration.companyId, externalId: unified.externalId, platform: 'shopify' },
                    { ...unified, companyId: integration.companyId },
                    { upsert: true, new: true }
                );

                // Sync Variants
                if (rawProd.variants && Array.isArray(rawProd.variants)) {
                    for (const v of rawProd.variants) {
                        await Variant.findOneAndUpdate(
                            { companyId: integration.companyId, sku: v.sku || `${product.sku}-${v.id}` },
                            {
                                companyId: integration.companyId,
                                productId: product._id,
                                sku: v.sku || `${product.sku}-${v.id}`,
                                price: parseFloat(v.price || 0),
                                costPrice: 0,
                                platformVariantId: v.id.toString(),
                                options: {
                                    size: v.option1,
                                    color: v.option2,
                                    material: v.option3
                                }
                            },
                            { upsert: true }
                        );
                    }
                }

                results.synced++;

            } catch (err) {
                if (err.code === 11000) results.duplicates++;
                else results.errors++;
            }
        }
        return results;
    } catch (err) {
        console.error('Shopify Sync Exception:', err.response?.data || err.message);
        throw new Error(`Shopify Product Sync Error: ${err.response?.statusText || err.message}`);
    }
};
