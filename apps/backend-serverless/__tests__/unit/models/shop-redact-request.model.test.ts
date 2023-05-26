import { parseAndValidateShopRedactRequestBody } from '../../../src/models/shop-redact-request.model.js';

describe('unit testing shop redact request model', () => {
    it('valid shop redact request body', () => {
        const validShopifyRequestHeaders = {
            shop_id: '123456',
            shop_domain: 'some-shop.myshopify.com',
        };

        expect(() => {
            parseAndValidateShopRedactRequestBody(validShopifyRequestHeaders);
        }).not.toThrow();
    });

    it('another valid shop redact request body', () => {
        const validShopifyRequestHeaders = {
            shop_id: 123456,
            shop_domain: 'some-shop.myshopify.com',
        };

        expect(() => {
            parseAndValidateShopRedactRequestBody(validShopifyRequestHeaders);
        }).not.toThrow();
    });
});
