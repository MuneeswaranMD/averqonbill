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
            status: 'connected'
        });

        if (!integration) {
            throw new Error(`Active ${product.platform} integration not found`);
        }

        if (product.platform === 'shopify') {
            return await pushToShopify(integration, product.externalId, product);
        } else if (product.platform === 'woocommerce') {
            return await pushToWooCommerce(integration, product.externalId, product);
        }

        return { success: false, message: 'Unsupported platform' };
    } catch (error) {
        console.error(`[Product Push Error] ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function pushToShopify(integration, externalId, product) {
    const { storeUrl, accessToken } = integration.credentials;
    const cleanUrl = storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`;
    
    const id = externalId.includes('/') ? externalId.split('/').pop() : externalId;
    const variantId = product.externalData?.variants?.[0]?.id;
    
    const url = `${cleanUrl.replace(/\/$/, '')}/admin/api/2024-01/products/${id}.json`;
    const payload = {
        product: {
            id: id,
            title: product.name,
            body_html: product.description,
            vendor: product.brand,
            product_type: product.category,
            variants: [
                {
                    id: variantId,
                    price: String(product.price),
                    sku: product.sku
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

async function pushToWooCommerce(integration, externalId, product) {
    const { storeUrl, consumerKey, consumerSecret } = integration.credentials;
    const cleanUrl = storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`;
    const url = `${cleanUrl.replace(/\/$/, '')}/wp-json/wc/v3/products/${externalId}`;
    
    const payload = {
        name: product.name,
        description: product.description,
        regular_price: String(product.price),
        sku: product.sku,
        categories: product.category ? [{ name: product.category }] : []
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
