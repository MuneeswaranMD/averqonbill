import axios from 'axios';
import Product from '../models/Product.js';
import Integration from '../models/Integration.js';

export async function pushProductToPlatform(companyId, productId, updateData) {
    try {
        const product = await Product.findOne({ _id: productId, companyId });
        if (!product || !product.platform || !product.externalId) {
            return { success: false, message: 'Product not eligible for external sync' };
        }

        const integration = await Integration.findOne({ 
            companyId, 
            platform: product.platform,
            status: 'active'
        });

        if (!integration) {
            throw new Error(`Active ${product.platform} integration not found`);
        }

        if (product.platform === 'shopify') {
            return await pushToShopify(integration, product.externalId, updateData);
        } else if (product.platform === 'woocommerce') {
            return await pushToWooCommerce(integration, product.externalId, updateData);
        }

        return { success: false, message: 'Unsupported platform' };
    } catch (error) {
        console.error(`[Product Push Error] ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function pushToShopify(integration, externalId, data) {
    const { shopUrl, accessToken } = integration.config;
    // Shopify stores ID as gid://shopify/Product/12345 or just 12345
    const id = externalId.includes('/') ? externalId.split('/').pop() : externalId;
    
    const url = `https://${shopUrl}/admin/api/2024-01/products/${id}.json`;
    const payload = {
        product: {
            id: id,
            title: data.name,
            body_html: data.description,
            vendor: data.brand,
            product_type: data.category,
            variants: [
                {
                    price: data.price,
                    sku: data.sku
                }
            ]
        }
    };

    await axios.put(url, payload, {
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
        }
    });

    return { success: true };
}

async function pushToWooCommerce(integration, externalId, data) {
    const { storeUrl, consumerKey, consumerSecret } = integration.config;
    const url = `${storeUrl.replace(/\/$/, '')}/wp-json/wc/v3/products/${externalId}`;
    
    const payload = {
        name: data.name,
        description: data.description,
        regular_price: String(data.price),
        sku: data.sku,
        categories: data.category ? [{ name: data.category }] : []
    };

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    await axios.put(url, payload, {
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    });

    return { success: true };
}
