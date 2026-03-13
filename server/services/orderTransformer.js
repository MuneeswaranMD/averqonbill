export const transformOrder = (platform, payload) => {
    let result = {
        platform: platform,
        status: 'new',
        createdAt: new Date(),
    };

    switch (platform) {
        case 'shopify':
            result = {
                ...result,
                externalId: payload.id?.toString(),
                source: 'Shopify',
                orderNumber: payload.name,
                customerName: `${payload.customer?.first_name || ''} ${payload.customer?.last_name || ''}`.trim() || 'Guest',
                customerEmail: payload.customer?.email || payload.email,
                totalAmount: parseFloat(payload.total_price || 0),
                currency: payload.currency,
                paymentStatus: payload.financial_status === 'paid' ? 'Paid' : 'Pending',
                
                // Fine-grained structure for future Use
                external: {
                    orderId: payload.id?.toString(),
                    source: 'Shopify',
                    orderNumber: payload.name,
                    rawData: payload
                },
                customer: {
                    name: `${payload.customer?.first_name || ''} ${payload.customer?.last_name || ''}`.trim() || 'Guest',
                    email: payload.customer?.email || payload.email,
                    phone: payload.customer?.phone || payload.phone
                },
                items: (payload.line_items || []).map(item => ({
                    productId: item.product_id?.toString(),
                    name: item.title,
                    qty: item.quantity,
                    price: parseFloat(item.price),
                    sku: item.sku
                })),
                pricing: {
                    total: parseFloat(payload.total_price || 0)
                },
                payment: {
                    status: payload.financial_status === 'paid' ? 'paid' : 'pending'
                }
            };
            break;

        case 'woocommerce':
            result = {
                ...result,
                externalId: payload.id?.toString(),
                source: 'WooCommerce',
                orderNumber: `#${payload.number}`,
                customerName: `${payload.billing?.first_name || ''} ${payload.billing?.last_name || ''}`.trim(),
                customerEmail: payload.billing?.email,
                totalAmount: parseFloat(payload.total || 0),
                currency: payload.currency,
                paymentStatus: payload.status === 'completed' || payload.status === 'processing' ? 'Paid' : 'Pending',

                external: {
                    orderId: payload.id?.toString(),
                    orderNumber: `#${payload.number}`,
                    rawData: payload
                },
                customer: {
                    name: `${payload.billing?.first_name || ''} ${payload.billing?.last_name || ''}`.trim(),
                    email: payload.billing?.email
                },
                items: (payload.line_items || []).map(item => ({
                    name: item.name,
                    qty: item.quantity,
                    price: parseFloat(item.price)
                })),
                pricing: { total: parseFloat(payload.total || 0) }
            };
            break;

        default:
            result = {
                ...result,
                externalId: payload.id || Date.now().toString(),
                source: payload.source || 'Custom API',
                orderNumber: payload.orderNumber || 'API-ORDER',
                customerName: payload.customerName || 'Anonymous',
                totalAmount: parseFloat(payload.total || 0),
                paymentStatus: payload.paymentStatus || 'Pending'
            };
    }

    return result;
};
