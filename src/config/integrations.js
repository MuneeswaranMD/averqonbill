export const INTEGRATION_PLATFORMS = [
    {
        id: 'shopify',
        name: 'Shopify',
        icon: 'ShoppingBag',
        color: 'bg-[#95BF47]',
        textColor: 'text-[#95BF47]',
        description: 'Sync online orders, inventory and customers from Shopify.',
        fields: [
            { id: 'storeUrl', label: 'Store URL', placeholder: 'your-store.myshopify.com', type: 'text' },
            { id: 'accessToken', label: 'Admin Access Token', placeholder: 'shpat_...', type: 'password' },
            { id: 'webhookSecret', label: 'Webhook Secret', placeholder: 'For security verification', type: 'password' },
        ],
        badge: 'Popular'
    },
    {
        id: 'woocommerce',
        name: 'WooCommerce',
        icon: 'Zap',
        color: 'bg-[#96588A]',
        textColor: 'text-[#96588A]',
        description: 'Connect your WordPress store via REST API.',
        fields: [
            { id: 'storeUrl', label: 'Store URL', placeholder: 'https://example.com', type: 'text' },
            { id: 'consumerKey', label: 'Consumer Key', placeholder: 'ck_...', type: 'password' },
            { id: 'consumerSecret', label: 'Consumer Secret', placeholder: 'cs_...', type: 'password' },
        ],
    },
    {
        id: 'magento',
        name: 'Magento 2',
        icon: 'Layers',
        color: 'bg-[#EE672F]',
        textColor: 'text-[#EE672F]',
        description: 'Enterprise grade integration for Magento Commerce.',
        fields: [
            { id: 'storeUrl', label: 'Store URL', placeholder: 'https://magento-store.com', type: 'text' },
            { id: 'accessToken', label: 'Integration Token', placeholder: 'Bearer token', type: 'password' },
        ],
    },
    {
        id: 'opencart',
        name: 'OpenCart',
        icon: 'Package',
        color: 'bg-[#2396d8]',
        textColor: 'text-[#2396d8]',
        description: 'Open-source e-commerce platform integration.',
        fields: [
            { id: 'storeUrl', label: 'Store URL', type: 'text' },
            { id: 'apiKey', label: 'API Key', type: 'password' },
        ],
    },
    {
        id: 'custom',
        name: 'Custom API',
        icon: 'Code2',
        color: 'bg-[#6366f1]',
        textColor: 'text-[#6366f1]',
        description: 'Send orders from any custom website using our Webhook URL.',
        fields: [
            { id: 'apiKey', label: 'Internal API Key', placeholder: 'Generated automatically', type: 'text', readOnly: true },
        ],
    }
];
