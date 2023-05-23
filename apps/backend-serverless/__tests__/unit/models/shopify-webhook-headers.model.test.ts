import { parseAndValidateShopifyWebhookHeaders } from '../../../src/models/shopify-webhook-headers.model.js';

describe('unit testing shopify webhooks headers model', () => {
    it('valid shopify webhooks headers', () => {
        const validShopifyRequestHeaders = {
            'X-Shopify-Topic': 'customers/data_request',
            'X-Shopify-Hmac-Sha256': 'some-hmac',
            'X-Shopify-Shop-Domain': 'some-api-version',
            'X-Shopify-API-Version': 'some-api-version',
            'X-Shopify-Webhook-Id': 'some-api-version',
            'X-Shopify-Triggered-At': 'some-api-version',
        };

        expect(() => {
            parseAndValidateShopifyWebhookHeaders(validShopifyRequestHeaders);
        }).not.toThrow();
    });
});
