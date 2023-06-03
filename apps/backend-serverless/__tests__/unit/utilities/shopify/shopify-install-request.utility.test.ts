import {
    ShopifyScope,
    createScopeString,
    createShopifyOAuthGrantRedirectUrl,
    verifyAndParseShopifyInstallRequest,
} from '../../../../src/utilities/shopify/shopify-install-request.utility.js';
import { parseAndValidateAppInstallQueryParms } from '../../../../src/models/shopify/install-query-params.model.js';
import { stringifyParams } from '../../../../src/utilities/shopify/stringify-params.utility.js';
import crypto from 'crypto-js';

describe('unit testing shopify install request utilities', () => {
    it('testing createShopifyOAuthGrantRedirectUrl', () => {
        process.env.BACKEND_URL = 'some-base-url.com';
        process.env.SHOPIFY_CLIENT_ID = 'some-client-id';

        const mockShop = 'some-shop.shopify.com';
        const mockNonce = 'some-random-nonce';

        const expectedUrl =
            'https://some-shop.shopify.com/admin/oauth/authorize?client_id=some-client-id&scope=write_payment_gateways,write_payment_sessions&redirect_uri=some-base-url.com/redirect&state=some-random-nonce';

        const generatedUrl = createShopifyOAuthGrantRedirectUrl(mockShop, mockNonce);

        expect(generatedUrl).toBe(expectedUrl);
    });

    it('testing createScopeString double', () => {
        const expectedString = 'write_payment_gateways,write_payment_sessions';

        const generatedString = createScopeString([
            ShopifyScope.WRITE_PAYMENT_GATEWAYS,
            ShopifyScope.WRITE_PAYMENT_SESSIONS,
        ]);

        expect(generatedString).toBe(expectedString);
    });

    it('testing createScopeString single', () => {
        const expectedString = 'write_payment_gateways';

        const generatedString = createScopeString([ShopifyScope.WRITE_PAYMENT_GATEWAYS]);

        expect(generatedString).toBe(expectedString);
    });

    it('testing createScopeString single', () => {
        const expectedString = 'write_payment_gateways';

        const generatedString = createScopeString([ShopifyScope.WRITE_PAYMENT_GATEWAYS]);

        expect(generatedString).toBe(expectedString);
    });

    it('testing verifyAndParseShopifyInstallRequest', () => {
        const mockShopifySecret = 'mock-shopify-secret-key';
        process.env.SHOPIFY_SECRET_KEY = mockShopifySecret;

        const installParams = {
            shop: 'https://some-shop.myshopify.com',
            host: 'some-host',
            timestamp: 'some-timestamp',
        };

        const stringifiedParams = stringifyParams(installParams);
        const hmac = crypto.HmacSHA256(stringifiedParams, mockShopifySecret);

        installParams['hmac'] = hmac.toString();

        expect(() => {
            verifyAndParseShopifyInstallRequest(installParams);
        }).not.toThrow();
    });

    it('testing verifyAndParseShopifyInstallRequest throwing', () => {
        const mockShopifySecret = 'mock-shopify-secret-key';
        const incorrectShopifySecret = 'incorrect-shopify-secret-key';
        process.env.SHOPIFY_SECRET_KEY = mockShopifySecret;

        const installParams = {
            shop: 'https://some-shop.myshopify.com',
            host: 'some-host',
            timestamp: 'some-timestamp',
        };

        const stringifiedParams = stringifyParams(installParams);
        const hmac = crypto.HmacSHA256(stringifiedParams, incorrectShopifySecret);

        installParams['hmac'] = hmac.toString();

        expect(() => {
            verifyAndParseShopifyInstallRequest(installParams);
        }).toThrow();
    });
});
