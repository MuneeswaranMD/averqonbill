import crypto from 'crypto';

export const verifyShopifyWebhook = (rawBody, hmacHeader, secret) => {
    if (!hmacHeader || !secret) return false;
    const hash = crypto
        .createHmac('sha256', secret)
        .update(rawBody, 'utf8')
        .digest('base64');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader));
};

export const verifyWooCommerceWebhook = (rawBody, signatureHeader, secret) => {
    if (!signatureHeader || !secret) return false;
    const hash = crypto
        .createHmac('sha256', secret)
        .update(rawBody, 'utf8')
        .digest('base64');
    return hash === signatureHeader;
};
