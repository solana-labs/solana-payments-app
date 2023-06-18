import { parseAndValidateMerchantAuthToken } from '../../../../../src/models/clients/merchant-ui/merchant-auth-token.model.js';

describe('unit testing the merchant auth token model', () => {
    it('valid merchant auth token body parsing', () => {
        const validInstallQueryParams = {
            id: 'some-id',
            iat: 123,
            exp: 123,
        };

        expect(() => {
            parseAndValidateMerchantAuthToken(validInstallQueryParams);
        }).not.toThrow();
    });

    it('invalid merchant auth token, missing id', () => {
        const validInstallQueryParams = {
            iat: 123,
            exp: 123,
        };

        expect(() => {
            parseAndValidateMerchantAuthToken(validInstallQueryParams);
        }).toThrow();
    });

    it('invalid merchant auth token, missing iat', () => {
        const validInstallQueryParams = {
            id: 'some-id',
            exp: 123,
        };

        expect(() => {
            parseAndValidateMerchantAuthToken(validInstallQueryParams);
        }).toThrow();
    });
});
