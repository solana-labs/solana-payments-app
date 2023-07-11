import * as crypto from 'crypto-js';
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
        const hash = crypto.HmacSHA256(mockShopifyPayloadString, mockShopifySecret);
        const mockHmacValue = crypto.enc.Base64.stringify(hash);

        expect(() => {
            verifyShopifyWebhook(mockShopifyPayloadString, mockHmacValue);
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
        const hash = crypto.HmacSHA256(mockShopifyPayloadString, mockInvalidShopifySecret);
        const mockHmacValue = crypto.enc.Base64.stringify(hash);

        expect(() => {
            verifyShopifyWebhook(mockShopifyPayloadString, mockHmacValue);
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
        const hash = crypto.HmacSHA256(mockShopifyPayloadString, mockShopifySecret);
        const mockHmacValue = crypto.enc.Base64.stringify(hash);

        expect(() => {
            verifyShopifyWebhook(mockInvalidShopifyPayloadString, mockHmacValue);
        }).toThrow();
    });
});
