import * as crypto from 'crypto-js';

export const verifyShopifyWebhook = (data: string, hmacHeader: string) => {
    const shopifySecret = process.env.SHOPIFY_SECRET;

    if (shopifySecret == null) {
        throw new Error('Shopify secret is not set');
    }

    let hash = crypto.HmacSHA256(data, shopifySecret);
    let hmac = crypto.enc.Base64.stringify(hash);

    if (hmac !== hmacHeader) {
        throw new Error('HMAC validation failed');
    }
};
