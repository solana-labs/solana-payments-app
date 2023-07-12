import * as crypto from 'crypto';
import { verifyShopifyWebhook } from '../../../../src/utilities/shopify/verify-shopify-webhook-header.utility.js';

describe('unit testing the verify shopify webhook utility', () => {
    const mockShopifySecret = 'this-is-a-mock-shopify-secret-key';
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
