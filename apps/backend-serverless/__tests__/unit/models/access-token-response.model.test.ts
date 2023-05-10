import { parseAndValidateAccessTokenResponse } from '../../../src/models/access-token-response.model'

describe('Merchant Testing Suite', () => {
    it('valid access token response', () => {
        const accessTokenValue = 'abcd-efgh'
        const scopeValue = 'read_products,write_products'

        const validAccessTokenResponseBody = {
            access_token: accessTokenValue,
            scope: scopeValue,
        }

        expect(() => {
            parseAndValidateAccessTokenResponse(validAccessTokenResponseBody)
        }).not.toThrow()
    })

    it('invalid access token response', () => {
        const scopeValue = 'read_products,write_products'

        const validAccessTokenResponseBody = {
            scope: scopeValue,
        }

        expect(() => {
            parseAndValidateAccessTokenResponse(validAccessTokenResponseBody)
        }).toThrow()
    })
})
