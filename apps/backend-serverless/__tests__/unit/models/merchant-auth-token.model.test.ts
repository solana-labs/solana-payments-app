import { parseAndValidateMerchantAuthToken } from '../../../src/models/merchant-auth-token.model.js';

describe('unit testing the merchant auth token model', () => {
    it('valid merchant auth token body parsing', () => {
        const validInstallQueryParams = {
            id: 'some-id',
            iat: 'some-date',
            exp: 'some-date',
        };

        expect(() => {
            parseAndValidateMerchantAuthToken(validInstallQueryParams);
        }).not.toThrow();
    });

    it('invalid merchant auth token, missing id', () => {
        const validInstallQueryParams = {
            iat: 'some-date',
            exp: 'some-date',
        };

        expect(() => {
            parseAndValidateMerchantAuthToken(validInstallQueryParams);
        }).toThrow();
    });

    it('invalid merchant auth token, missing iat', () => {
        const validInstallQueryParams = {
            id: 'some-id',
            exp: 'some-date',
        };

        expect(() => {
            parseAndValidateMerchantAuthToken(validInstallQueryParams);
        }).toThrow();
    });
});
