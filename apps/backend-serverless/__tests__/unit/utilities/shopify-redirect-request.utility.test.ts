import { parseAndValidateAppRedirectQueryParams } from '../../../src/models/redirect-query-params.model';
import { verifyRedirectParams } from '../../../src/utilities/shopify-redirect-request.utility';
import { stringifyParams } from '../../../src/utilities/stringify-params.utility.js';
import crypto from 'crypto-js';
import { prismaMock } from '../../../prisma-singleton.js';

describe('unit testing shopify install request utilities', () => {
    it('testing verifyAndParseShopifyRedirectRequest', () => {
        const mockShopifySecret = 'mock-shopify-secret-key';
        process.env.SHOPIFY_SECRET_KEY = mockShopifySecret;

        const redirectParams = {
            code: 'some-code',
            shop: 'https://some-shop.myshopify.com',
            host: 'https://some-shop.myshopify.com',
            state: 'some-state',
            timestamp: 'some-timestamp',
        };

        const stringifiedParams = stringifyParams(redirectParams);
        const hmac = crypto.HmacSHA256(stringifiedParams, mockShopifySecret);

        redirectParams['hmac'] = hmac.toString();

        const params = parseAndValidateAppRedirectQueryParams(redirectParams);

        const mockMerchant = createMockM;

        prismaMock.paymentRecord.findFirst.mockResolvedValue(mockPaymentRecord);

        expect(() => {
            verifyRedirectParams(params);
        }).not.toThrow();
    });

    it('testing verifyAndParseShopifyRedirectRequest throwing', () => {
        const mockShopifySecret = 'mock-shopify-secret-key';
        const incorrectShopifySecret = 'incorrect-shopify-secret-key';
        process.env.SHOPIFY_SECRET_KEY = mockShopifySecret;

        const redirectParams = {
            code: 'some-code',
            shop: 'https://some-shop.myshopify.com',
            host: 'https://some-shop.myshopify.com',
            state: 'some-state',
            timestamp: 'some-timestamp',
        };

        const stringifiedParams = stringifyParams(redirectParams);
        const hmac = crypto.HmacSHA256(stringifiedParams, incorrectShopifySecret);

        redirectParams['hmac'] = hmac.toString();

        expect(() => {
            verifyAndParseShopifyRedirectRequest(redirectParams);
        }).toThrow();
    });
});
