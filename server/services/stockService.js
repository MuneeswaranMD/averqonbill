import Product from '../models/Product.js';

/**
 * Automatically decrements stock levels when an order is processed.
 * Supports both integrated products and local products.
 */
export const updateStockFromOrder = async (companyId, order) => {
    const results = { updated: 0, notFound: 0, errors: 0 };

    if (!order.items || !Array.isArray(order.items)) return results;

    for (const item of order.items) {
        try {
            // 1. Try to find the product by SKU or External ID
            // We search both to handle cross-platform matching
            const product = await Product.findOne({
                companyId,
                $or: [
                    { sku: item.sku },
                    { externalId: item.productId?.toString() },
                    { name: item.name } // Fallback for some platforms
                ]
            });

            if (product) {
                const qty = Number(item.qty || 1);
                
                // 2. Decrement the stock (ensure it doesn't go below 0 unless allowed)
                product.stock = Math.max(0, (product.stock || 0) - qty);
                await product.save();
                
                console.log(`[Stock] Decremented ${product.name} by ${qty}. New stock: ${product.stock}`);
                results.updated++;
            } else {
                console.warn(`[Stock] Product not found for item: ${item.name} (${item.sku || 'No SKU'})`);
                results.notFound++;
            }
        } catch (err) {
            console.error(`[Stock] Error updating stock for item ${item.name}:`, err.message);
            results.errors++;
        }
    }

    return results;
};
