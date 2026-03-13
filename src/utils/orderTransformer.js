/**
 * Unifies diverse platform order payloads into a standard internal "Order" structure.
 */
export const transformExternalOrder = (platform, payload) => {
    switch (platform) {
        case 'shopify':
            return {
                externalId: payload.id.toString(),
                source: 'Shopify',
                orderNumber: payload.name || `#${payload.order_number}`,
                customerName: `${payload.customer?.first_name || ''} ${payload.customer?.last_name || ''}`.trim() || 'Guest Customer',
                customerEmail: payload.customer?.email || payload.email,
                totalAmount: parseFloat(payload.total_price),
                currency: payload.currency,
                items: (payload.line_items || []).map(item => ({
                    productId: item.product_id?.toString(),
                    name: item.title,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    sku: item.sku
                })),
                shippingAddress: {
                    address: payload.shipping_address?.address1,
                    city: payload.shipping_address?.city,
                    zip: payload.shipping_address?.zip,
                    country: payload.shipping_address?.country
                },
                paymentStatus: payload.financial_status === 'paid' ? 'Paid' : 'Pending',
                status: 'Processing',
                raw: payload
            };

        case 'woocommerce':
            return {
                externalId: payload.id.toString(),
                source: 'WooCommerce',
                orderNumber: `#${payload.number}`,
                customerName: `${payload.billing?.first_name || ''} ${payload.billing?.last_name || ''}`.trim(),
                customerEmail: payload.billing?.email,
                totalAmount: parseFloat(payload.total),
                currency: payload.currency,
                items: (payload.line_items || []).map(item => ({
                    productId: item.product_id?.toString(),
                    name: item.name,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    sku: item.sku
                })),
                shippingAddress: {
                    address: payload.shipping?.address_1,
                    city: payload.shipping?.city,
                    zip: payload.shipping?.postcode,
                    country: payload.shipping?.country
                },
                paymentStatus: payload.status === 'completed' || payload.status === 'processing' ? 'Paid' : 'Pending',
                status: 'Processing',
                raw: payload
            };

        case 'magento':
            return {
                externalId: payload.entity_id.toString(),
                source: 'Magento',
                orderNumber: payload.increment_id,
                customerName: `${payload.customer_firstname || ''} ${payload.customer_lastname || ''}`.trim(),
                customerEmail: payload.customer_email,
                totalAmount: parseFloat(payload.grand_total),
                currency: payload.order_currency_code,
                items: (payload.items || []).map(item => ({
                    productId: item.product_id?.toString(),
                    name: item.name,
                    quantity: item.qty_ordered,
                    price: parseFloat(item.price),
                    sku: item.sku
                })),
                paymentStatus: 'Paid',
                status: 'Processing',
                raw: payload
            };

        case 'custom':
        default:
            return {
                externalId: payload.id || Date.now().toString(),
                source: payload.source || 'Custom API',
                orderNumber: payload.orderNumber || `EXT-${Date.now()}`,
                customerName: payload.name || payload.customerName || 'Anonymous',
                customerEmail: payload.email || payload.customerEmail,
                totalAmount: parseFloat(payload.total || 0),
                currency: payload.currency || 'INR',
                items: (payload.items || []).map(item => ({
                    name: item.name,
                    quantity: item.quantity || 1,
                    price: parseFloat(item.price || 0)
                })),
                paymentStatus: payload.paymentStatus || 'Pending',
                status: payload.status || 'Received',
                raw: payload
            };
    }
};
