import { parseAndValidateShopifyRequestHeaders } from '../../../src/models/shopify-request-headers.model.js';

describe('unit testing shopify request headers model', () => {
    it('valid shopify request headers', () => {
        const validShopifyRequestHeaders = {
            'shopify-shop-domain': 'some-shop.myshopify.com',
            'shopify-request-id': 'some-hmac',
            'shopify-api-version': 'some-api-version',
        };

        expect(() => {
            parseAndValidateShopifyRequestHeaders(validShopifyRequestHeaders);
        }).not.toThrow();
    });

    it('missing shop domain', () => {
        const invalidShopifyRequestHeaders = {
            'shopify-request-id': 'some-hmac',
            'shopify-api-version': 'some-api-version',
        };

        expect(() => {
            parseAndValidateShopifyRequestHeaders(invalidShopifyRequestHeaders);
        }).toThrow();
    });

    it('missing request id', () => {
        const invalidShopifyRequestHeaders = {
            'shopify-shop-domain': 'some-shop.myshopify.com',
            'shopify-api-version': 'some-api-version',
        };

        expect(() => {
            parseAndValidateShopifyRequestHeaders(invalidShopifyRequestHeaders);
        }).toThrow();
    });

    it('missing api version', () => {
        const invalidShopifyRequestHeaders = {
            'shopify-shop-domain': 'some-shop.myshopify.com',
            'shopify-request-id': 'some-hmac',
        };

        expect(() => {
            parseAndValidateShopifyRequestHeaders(invalidShopifyRequestHeaders);
        }).toThrow();
    });
});
