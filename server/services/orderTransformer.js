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
                
                customer: {
                    name: `${payload.customer?.first_name || ''} ${payload.customer?.last_name || ''}`.trim() || 'Guest',
                    email: payload.customer?.email || payload.email,
                    phone: payload.customer?.phone || payload.phone || payload.billing_address?.phone,
                    billingAddress: {
                        address1: payload.billing_address?.address1,
                        city: payload.billing_address?.city,
                        province: payload.billing_address?.province,
                        country: payload.billing_address?.country,
                        zip: payload.billing_address?.zip
                    },
                    shippingAddress: {
                        address1: payload.shipping_address?.address1,
                        city: payload.shipping_address?.city,
                        province: payload.shipping_address?.province,
                        country: payload.shipping_address?.country,
                        zip: payload.shipping_address?.zip
                    }
                },
                items: (payload.line_items || []).map(item => ({
                    productId: item.product_id?.toString(),
                    name: item.title,
                    qty: item.quantity,
                    price: parseFloat(item.price),
                    sku: item.sku,
                    total: parseFloat(item.price) * item.quantity
                })),
                pricing: {
                    subtotal: parseFloat(payload.subtotal_price || 0),
                    totalTax: parseFloat(payload.total_tax || 0),
                    totalDiscounts: parseFloat(payload.total_discounts || 0),
                    total: parseFloat(payload.total_price || 0)
                },
                external: {
                    orderId: payload.id?.toString(),
                    orderNumber: payload.name,
                    rawData: payload
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

                customer: {
                    name: `${payload.billing?.first_name || ''} ${payload.billing?.last_name || ''}`.trim(),
                    email: payload.billing?.email,
                    phone: payload.billing?.phone,
                    billingAddress: {
                        address1: payload.billing?.address_1,
                        address2: payload.billing?.address_2,
                        city: payload.billing?.city,
                        state: payload.billing?.state,
                        country: payload.billing?.country,
                        zip: payload.billing?.postcode
                    },
                    shippingAddress: {
                        address1: payload.shipping?.address_1,
                        address2: payload.shipping?.address_2,
                        city: payload.shipping?.city,
                        state: payload.shipping?.state,
                        country: payload.shipping?.country,
                        zip: payload.shipping?.postcode
                    }
                },
                items: (payload.line_items || []).map(item => ({
                    productId: item.product_id?.toString(),
                    name: item.name,
                    qty: item.quantity,
                    price: parseFloat(item.price),
                    sku: item.sku,
                    total: parseFloat(item.total || 0)
                })),
                pricing: {
                    subtotal: parseFloat(payload.discount_total || 0) + parseFloat(payload.total || 0) - parseFloat(payload.total_tax || 0),
                    totalTax: parseFloat(payload.total_tax || 0),
                    shippingTotal: parseFloat(payload.shipping_total || 0),
                    total: parseFloat(payload.total || 0)
                },
                external: {
                    orderId: payload.id?.toString(),
                    orderNumber: `#${payload.number}`,
                    rawData: payload
                }
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
                paymentStatus: payload.paymentStatus || 'Pending',
                items: payload.items || []
            };
    }

    return result;
};
