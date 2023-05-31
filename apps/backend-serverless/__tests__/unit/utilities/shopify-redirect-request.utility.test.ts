import { parseAndValidateAppRedirectQueryParams } from '../../../src/models/shopify/redirect-query-params.model.js';
import { verifyRedirectParams } from '../../../src/utilities/shopify-redirect-request.utility';
import { stringifyParams } from '../../../src/utilities/stringify-params.utility.js';
import crypto from 'crypto-js';
import { prismaMock } from '../../../prisma-singleton.js';
import { createMockMerchant } from '../../../src/utilities/testing-helper/create-mock.utility.js';

describe('unit testing shopify install request utilities', () => {
    it('testing verifyAndParseShopifyRedirectRequest', async () => {
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

        const mockMerchant = createMockMerchant({ shop: 'https://some-shop.myshopify.com', lastNonce: 'some-state' });

        prismaMock.merchant.findUnique.mockResolvedValue(mockMerchant);

        // expect(() => {
        //     verifyRedirectParams(params, prismaMock);
        // }).not.toThrow();

        await expect(verifyRedirectParams(params, prismaMock)).resolves.not.toThrow();
    });

    it('testing verifyAndParseShopifyRedirectRequest throwing', async () => {
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

        const params = parseAndValidateAppRedirectQueryParams(redirectParams);

        const mockMerchant = createMockMerchant();

        prismaMock.merchant.findUnique.mockResolvedValue(mockMerchant);

        await expect(verifyRedirectParams(params, prismaMock)).rejects.toThrow();
    });
});
