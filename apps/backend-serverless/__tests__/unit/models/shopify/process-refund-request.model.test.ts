import { parseAndValidateShopifyRefundInitiation } from '../../../../src/models/shopify/process-refund.request.model.js';

describe('unit testing shopify refund initiation model', () => {
    it('valid shopify refund initiation', () => {
        const validShopifyRefundInitiation = {
            id: 'PJUG6iB0xU7czy1ZN3xEwn4o',
            gid: 'gid://shopify/RefundSession/PJUG6iB0xU7czy1ZN3xEwn4o',
            payment_id: 'u0nwmSrNntjIWozmNslK5Tlq',
            amount: '123.00',
            currency: 'CAD',
            test: false,
            merchant_locale: 'en',
            proposed_at: '2021-07-13T00:00:00Z',
        };

        expect(() => {
            parseAndValidateShopifyRefundInitiation(validShopifyRefundInitiation);
        }).not.toThrow();
    });

    it('missing gid in response', () => {
        const invalidShopifyRefundInitiation = {
            id: 'PJUG6iB0xU7czy1ZN3xEwn4o',
            payment_id: 'u0nwmSrNntjIWozmNslK5Tlq',
            amount: '123.00',
            currency: 'CAD',
            test: false,
            merchant_locale: 'en',
            proposed_at: '2021-07-13T00:00:00Z',
        };

        expect(() => {
            parseAndValidateShopifyRefundInitiation(invalidShopifyRefundInitiation);
        }).toThrow();
    });
});
