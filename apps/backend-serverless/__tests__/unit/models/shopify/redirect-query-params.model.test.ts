import { parseAndValidateAppRedirectQueryParams } from '../../../../src/models/shopify/redirect-query-params.model.js';

describe('unit testing redirect query parameters model', () => {
    it('valid query parameters', () => {
        const validRedirectQueryParams = {
            code: 'some-code',
            hmac: 'some-hmac',
            shop: 'https://some-shop.myshopify.com',
            host: 'https://some-shop.myshopify.com',
            state: 'some-state',
            timestamp: 'some-timestamp',
        };

        expect(() => {
            parseAndValidateAppRedirectQueryParams(validRedirectQueryParams);
        }).not.toThrow();
    });

    it('missing code parameter', () => {
        const invalidRedirectQueryParams = {
            hmac: 'some-hmac',
            shop: 'https://some-shop.myshopify.com',
            host: 'https://some-shop.myshopify.com',
            state: 'some-state',
            timestamp: 'some-timestamp',
        };

        expect(() => {
            parseAndValidateAppRedirectQueryParams(invalidRedirectQueryParams);
        }).toThrow();
    });
});
