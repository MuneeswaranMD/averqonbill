import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import Inventory from '../models/Inventory.js';
import Warehouse from '../models/Warehouse.js';
import { pushInventoryToPlatform } from './inventoryPush.js';


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

/**
 * Increments stock when items are received from a supplier.
 */
export const receiveStock = async (companyId, purchaseOrder) => {
    const results = { updated: 0, errors: 0 };
    
    try {
        const warehouseId = purchaseOrder.warehouseId;
        
        for (const item of purchaseOrder.items) {
            try {
                let inventory = await Inventory.findOne({ 
                    variantId: item.variantId, 
                    warehouseId: warehouseId 
                });

                if (!inventory) {
                    inventory = new Inventory({
                        variantId: item.variantId,
                        warehouseId: warehouseId,
                        quantity: 0
                    });
                }

                const receivedAmount = Number(item.receivedQty || item.qty);
                inventory.quantity += receivedAmount;
                await inventory.save(); // Triggers 'pre-save' available calculation

                // Sync to external platforms if applicable
                const variant = await Variant.findById(item.variantId);
                const product = await Product.findById(variant?.productId);
                if (product && product.platform) {
                    // We assume the received stock should be pushed to the platform
                    await pushInventoryToPlatform(companyId, product._id, inventory.available, variant._id);
                }

                results.updated++;
            } catch (err) {
                console.error(`[Stock] Error receiving item ${item.variantId}:`, err.message);
                results.errors++;
            }
        }
    } catch (err) {
        console.error(`[Stock] Global error in receiveStock:`, err.message);
    }
    
    return results;
};

/**
 * Manual inventory adjustment.
 */
export const adjustStock = async (companyId, variantId, warehouseId, quantity, reason = 'manual') => {
    try {
        let inventory = await Inventory.findOne({ variantId, warehouseId });
        
        if (!inventory) {
            inventory = new Inventory({ variantId, warehouseId, quantity: 0 });
        }

        inventory.quantity = quantity;
        await inventory.save();

        // Sync to external platforms
        const variant = await Variant.findById(variantId);
        const product = await Product.findById(variant?.productId);
        if (product && product.platform) {
            await pushInventoryToPlatform(companyId, product._id, inventory.available, variantId);
        }

        return { success: true, inventory };
    } catch (err) {
        console.error(`[Stock] Adjustment error:`, err.message);
        throw err;
    }
};

