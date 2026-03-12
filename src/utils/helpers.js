/**
 * Formats a number to Indian Rupee (INR) currency format.
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Sends a WhatsApp message using the public WhatsApp Web API.
 * @param {string} phone 
 * @param {string} message 
 */
export const sendWhatsApp = (phone, message) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

/**
 * Simulation for Razorpay Payment Link Generation.
 * In a real-world scenario, this should be called from a secure backend or Firebase Cloud Function.
 */
export const createRazorpayPaymentLink = async (amount, customerName, phone, orderId) => {
    console.log(`Generating Razorpay link for Order ${orderId} Amount: ${amount}`);
    
    // In production, use the fetch logic from your request.
    // For now, we return a mock success link.
    return `https://rzp.io/i/${Math.random().toString(36).substring(7)}`;
};

/**
 * Generates a unique invoice or order number.
 * @param {string} prefix 
 * @returns {string}
 */
export const generateId = (prefix = 'ID') => {
    return `${prefix}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).tolowercase()}`;
};
