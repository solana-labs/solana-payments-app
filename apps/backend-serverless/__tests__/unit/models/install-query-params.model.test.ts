import { parseAndValidateAppInstallQueryParms } from '../../../src/models/install-query-params.model'

describe('Install Query Params Model', () => {
    it('valid query params', () => {
        const validInstallQueryParams = {
            hmac: 'some-hmac',
            shop: 'https://some-shop.myshopify.com',
            host: 'some-host',
            timestamp: 'some-timestamp',
        }

        expect(() => {
            parseAndValidateAppInstallQueryParms(validInstallQueryParams)
        }).not.toThrow()
    })

    it('invalid shop parameter', () => {
        const validInstallQueryParams = {
            hmac: 'some-hmac',
            shop: 'some-shop',
            host: 'some-host',
            timestamp: 'some-timestamp',
        }

        expect(() => {
            parseAndValidateAppInstallQueryParms(validInstallQueryParams)
        }).toThrow()
    })

    it('missing parameter', () => {
        const validInstallQueryParams = {
            hmac: 'some-hmac',
            host: 'some-host',
            timestamp: 'some-timestamp',
        }

        expect(() => {
            parseAndValidateAppInstallQueryParms(validInstallQueryParams)
        }).toThrow()
    })
})
