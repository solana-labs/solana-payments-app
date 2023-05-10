import { parseAndValidateAccessTokenResponse } from '../../../src/models/access-token-response.model'

describe('Merchant Testing Suite', () => {
    it('valid access token response', () => {
        const accessTokenValue = 'abcd-efgh'
        const scopeValue = 'read_products,write_products'

        const validAccessTokenResponseBody = {
            acccess_token: accessTokenValue,
            scope: scopeValue,
        }

        expect(() => {
            parseAndValidateAccessTokenResponse(validAccessTokenResponseBody)
        }).resolves.not.toThrow()
    })
})
