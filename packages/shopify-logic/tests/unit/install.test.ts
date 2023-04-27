import {
    verifyShopifyInstallRequest,
    createScopeString,
    ShopifyScope,
    verifyShopifyRedirectRequest,
    parseAppInstallQueryParms,
} from '../../src'
import queryString from 'query-string'
import crypto from 'crypto-js'

describe('testing parseAppInstallQueryParms', () => {
    beforeEach(() => {
        process.env.SHOPIFY_SECRET_KEY = 'abcdefghijklmnopqrstuvwxyz'
    })

    afterEach(() => {
        delete process.env.SHOPIFY_SECRET_KEY
    })

    it('all values correct and populated', async () => {
        const testQueryParms = {
            hmac: 'abcdefghijklmnopqrstuvwxyz',
            shop: 'https://test.myshopify.com',
            timestamp: '123456789',
        }

        expect(() => parseAppInstallQueryParms(testQueryParms)).not.toThrow()
    })

    it('hmac missing, still correct', async () => {
        const testQueryParms = {
            shop: 'https://test.myshopify.com',
            timestamp: '123456789',
        }

        expect(() => parseAppInstallQueryParms(testQueryParms)).not.toThrow()
    })

    it('timestamp missing, not correct', async () => {
        const testQueryParms = {
            hmac: 'abcdefghijklmnopqrstuvwxyz',
            shop: 'https://test.myshopify.com',
        }

        expect(() => parseAppInstallQueryParms(testQueryParms)).not.toThrow()
    })

    it('shop missing, not correct', async () => {
        const testQueryParms = {
            hmac: 'abcdefghijklmnopqrstuvwxyz',
            timestamp: '123456789',
        }

        expect(() => parseAppInstallQueryParms(testQueryParms)).not.toThrow()
    })

    it('shop incorrect', async () => {
        const testQueryParms = {
            hmac: 'abcdefghijklmnopqrstuvwxyz',
            shop: 'https://myshopify.com',
            timestamp: '123456789',
        }

        expect(() => parseAppInstallQueryParms(testQueryParms)).not.toThrow()
    })
})

describe('testing createScopeString', () => {
    it('single value', async () => {
        const testScopeString = createScopeString([
            ShopifyScope.WRITE_PAYMENT_GATEWAYS,
        ])

        const EXPECTED_VALUE = 'write_payment_gateways'

        expect(testScopeString).toEqual(EXPECTED_VALUE)
    })

    it('multiple values', async () => {
        const testScopeString = createScopeString([
            ShopifyScope.WRITE_PAYMENT_GATEWAYS,
            ShopifyScope.WRITE_PAYMENT_SESSIONS,
        ])

        const EXPECTED_VALUE = 'write_payment_gateways,write_payment_sessions'

        expect(testScopeString).toEqual(EXPECTED_VALUE)
    })
})

describe('testing verifyShopifyInstallRequest', () => {
    beforeEach(() => {
        process.env.SHOPIFY_SECRET_KEY = 'SOME_STATIC_SECRET_FROM_SHOP'
    })

    afterEach(() => {
        delete process.env.SHOPIFY_SECRET_KEY
    })

    it('happy path', async () => {
        const secret = process.env.SHOPIFY_SECRET_KEY!

        const encodingParams = {
            shop: 'https://test.myshopify.com',
            timestamp: '123456789',
        }

        const encodingParamsQueryString = queryString.stringify(encodingParams)

        const digest = crypto.HmacSHA256(encodingParamsQueryString, secret)
        const digestString = digest.toString()

        const testQueryParms = {
            hmac: digestString,
            shop: 'https://test.myshopify.com',
            timestamp: '123456789',
        }

        expect(() => verifyShopifyInstallRequest(testQueryParms)).not.toThrow()
    })

    it('incorrect shop name', async () => {
        const secret = process.env.SHOPIFY_SECRET_KEY!

        const encodingParams = {
            shop: 'https://incorrect.myshopify.com',
            timestamp: '123456789',
        }

        const encodingParamsQueryString = queryString.stringify(encodingParams)

        const digest = crypto.HmacSHA256(encodingParamsQueryString, secret)
        const digestString = digest.toString()

        const testQueryParms = {
            hmac: digestString,
            shop: 'https://test.myshopify.com',
            timestamp: '123456789',
        }

        expect(() => verifyShopifyInstallRequest(testQueryParms)).toThrow()
    })

    it('incorrect timestamp', async () => {
        const secret = process.env.SHOPIFY_SECRET_KEY!

        const encodingParams = {
            shop: 'https://test.myshopify.com',
            timestamp: '0000000000',
        }

        const encodingParamsQueryString = queryString.stringify(encodingParams)

        const digest = crypto.HmacSHA256(encodingParamsQueryString, secret)
        const digestString = digest.toString()

        const testQueryParms = {
            hmac: digestString,
            shop: 'https://test.myshopify.com',
            timestamp: '123456789',
        }

        expect(() => verifyShopifyInstallRequest(testQueryParms)).toThrow()
    })
})

describe('testing verifyShopifyRedirectRequest', () => {
    beforeEach(() => {
        process.env.SHOPIFY_SECRET_KEY = 'SOME_STATIC_SECRET_FROM_SHOP'
    })

    afterEach(() => {
        delete process.env.SHOPIFY_SECRET_KEY
    })

    it('happy path', async () => {
        const secret = process.env.SHOPIFY_SECRET_KEY!

        const encodingQueryParams = {
            shop: 'https://test.myshopify.com',
            timestamp: '123456789',
            code: 'abcdefghijklmnopqrstuvwxyz',
            host: 'https://test.myshopify.com',
            state: 'abcdefghijklmnopqrstuvwxyz',
        }

        const encodingParamsQueryString =
            queryString.stringify(encodingQueryParams)

        const digest = crypto.HmacSHA256(encodingParamsQueryString, secret)
        const digestString = digest.toString()

        const testQueryParms = {
            shop: 'https://test.myshopify.com',
            hmac: digestString,
            timestamp: '123456789',
            code: 'abcdefghijklmnopqrstuvwxyz',
            host: 'https://test.myshopify.com',
            state: 'abcdefghijklmnopqrstuvwxyz',
        }

        expect(() => verifyShopifyRedirectRequest(testQueryParms)).not.toThrow()
    })

    it('incorrect shop name', async () => {
        const secret = process.env.SHOPIFY_SECRET_KEY!

        const encodingQueryParams = {
            shop: 'https://test.myshopify.com',
            timestamp: '123456789',
            code: 'abcdefghijklmnopqrstuvwxyz',
            host: 'https://test.myshopify.com',
            state: 'abcdefghijklmnopqrstuvwxyz',
        }

        const encodingParamsQueryString =
            queryString.stringify(encodingQueryParams)

        const digest = crypto.HmacSHA256(encodingParamsQueryString, secret)
        const digestString = digest.toString()

        const testQueryParms = {
            shop: 'https!!!!//incorrect.myshopify.com',
            hmac: digestString,
            timestamp: '123456789',
            code: 'abcdefghijklmnopqrstuvwxyz',
            host: 'https://test.myshopify.com',
            state: 'abcdefghijklmnopqrstuvwxyz',
        }

        expect(() => verifyShopifyRedirectRequest(testQueryParms)).toThrow()
    })

    it('incorrect timestamp', async () => {
        const secret = process.env.SHOPIFY_SECRET_KEY!

        const encodingQueryParams = {
            shop: 'https://test.myshopify.com',
            timestamp: '123456789',
            host: 'https://test.myshopify.com',
            state: 'abcdefghijklmnopqrstuvwxyz',
        }

        const encodingParamsQueryString =
            queryString.stringify(encodingQueryParams)

        const digest = crypto.HmacSHA256(encodingParamsQueryString, secret)
        const digestString = digest.toString()

        const testQueryParms = {
            shop: 'https://test.myshopify.com',
            hmac: digestString,
            timestamp: '123456789',
            host: 'https://test.myshopify.com',
            state: 'abcdefghijklmnopqrstuvwxyz',
        }

        expect(() => verifyShopifyRedirectRequest(testQueryParms)).toThrow()
    })
})
