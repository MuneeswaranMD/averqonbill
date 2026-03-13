export const transformProduct = (platform, payload) => {
    let result = {
        platform: platform,
        status: 'active',
    };

    switch (platform) {
        case 'shopify':
            const variant = payload.variants?.[0] || {};
            result = {
                ...result,
                externalId: payload.id?.toString(),
                name: payload.title,
                sku: variant.sku || payload.handle,
                description: payload.body_html,
                price: parseFloat(variant.price || 0),
                compareAtPrice: parseFloat(variant.compare_at_price || 0),
                stock: variant.inventory_quantity || 0,
                category: payload.product_type,
                images: (payload.images || []).map(img => img.src),
                externalData: payload
            };
            break;

        case 'woocommerce':
            result = {
                ...result,
                externalId: payload.id?.toString(),
                name: payload.name,
                sku: payload.sku,
                description: payload.description,
                price: parseFloat(payload.price || 0),
                compareAtPrice: parseFloat(payload.regular_price || 0),
                stock: payload.stock_quantity || (payload.manage_stock ? 0 : 999),
                category: (payload.categories || [])[0]?.name || 'Uncategorized',
                images: (payload.images || []).map(img => img.src),
                externalData: payload
            };
            break;

        default:
            result = {
                ...result,
                externalId: payload.id || Date.now().toString(),
                name: payload.name || 'Unknown Product',
                price: parseFloat(payload.price || 0),
                stock: payload.stock || 0
            };
    }

    return result;
};
