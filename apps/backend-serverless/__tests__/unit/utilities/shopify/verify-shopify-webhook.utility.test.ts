import * as crypto from 'crypto';
import { verifyShopifyWebhook } from '../../../../src/utilities/shopify/verify-shopify-webhook-header.utility.js';

describe('unit testing the verify shopify webhook utility', () => {
    const mockShopifySecret = 'ec4d61947aac7ff89d4ee1c703bdc548';
    process.env.SHOPIFY_SECRET_KEY = mockShopifySecret;
    it('valid webhook', () => {
        // Create my mock body
        const mockShopifyPayload = {
            foo: 'Anatoly',
            bar: 'Vitalik',
        };
        const mockShopifyPayloadString = JSON.stringify(mockShopifyPayload);

        // Create the HMAC value
        const hmac = crypto.createHmac('sha256', mockShopifySecret).update(mockShopifyPayloadString).digest('base64');

        expect(() => {
            verifyShopifyWebhook(Buffer.from(mockShopifyPayloadString), hmac);
        }).not.toThrow();
    });

    it('another valid hook', () => {
        const mockShopifyPayload = { shop_id: 60225617942, shop_domain: 'app-security.myshopify.com' };
        const mockShopifyPayloadString = JSON.stringify(mockShopifyPayload);
        const hmac = crypto.createHmac('sha256', mockShopifySecret).update(mockShopifyPayloadString).digest('base64');
        const webhookHeaders = {
            'x-shopify-hmac-sh256': hmac,
        };
        console.log('webhookHeaders, and hmac', webhookHeaders, hmac);

        expect(() => {
            verifyShopifyWebhook(Buffer.from(mockShopifyPayloadString), webhookHeaders['x-shopify-hmac-sha256']);
        });
    });

    it('invalid webhook, wrong secret key for hash', () => {
        const mockInvalidShopifySecret = 'this-is-not-the-key-you-are-looking-for';

        // Create my mock body
        const mockShopifyPayload = {
            foo: 'Anatoly',
            bar: 'Vitalik',
        };
        const mockShopifyPayloadString = JSON.stringify(mockShopifyPayload);

        // Create the HMAC value
        const hmac = crypto
            .createHmac('sha256', mockInvalidShopifySecret)
            .update(mockShopifyPayloadString)
            .digest('base64');

        expect(() => {
            verifyShopifyWebhook(Buffer.from(mockShopifyPayloadString), hmac);
        }).toThrow();
    });

    it('invalid webhook, different value in body', () => {
        // Create my mock body
        const mockShopifyPayload = {
            foo: 'Anatoly',
            bar: 'Vitalik',
        };
        const mockShopifyPayloadString = JSON.stringify(mockShopifyPayload);
        const mockInvalidShopifyPayload = {
            foo: 'Anatoly',
            bar: 'Satoshi',
        };
        const mockInvalidShopifyPayloadString = JSON.stringify(mockInvalidShopifyPayload);

        // Create the HMAC value
        const hmac = crypto.createHmac('sha256', mockShopifySecret).update(mockShopifyPayloadString).digest('base64');

        expect(() => {
            verifyShopifyWebhook(Buffer.from(mockInvalidShopifyPayloadString), hmac);
        }).toThrow();
    });
});
