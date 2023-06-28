import { parseAndValidateMerchantAuthToken } from '../../../../../src/models/clients/merchant-ui/merchant-auth-token.model.js';

describe('unit testing the merchant auth token model', () => {
    const fields = ['id', 'iat', 'exp'];
    const validInstallQueryParams = {
        id: 'some-id',
        iat: 123,
        exp: 123,
    };

    it('valid merchant auth token body parsing', () => {
        expect(() => {
            parseAndValidateMerchantAuthToken(validInstallQueryParams);
        }).not.toThrow();
    });

    for (const field of fields) {
        it(`invalid merchant auth token, missing ${field}`, () => {
            const testParams = { ...validInstallQueryParams }; // create a clone of the valid params
            delete testParams[field]; // remove a field to simulate invalid input

            expect(() => {
                parseAndValidateMerchantAuthToken(testParams);
            }).toThrow();
        });
    }

    const wrongTypes = {
        id: 123, // should be a string
        iat: '123', // should be a number
        exp: '123', // should be a number
    };

    for (const field of fields) {
        it(`invalid merchant auth token, wrong type for ${field}`, () => {
            const testParams = { ...validInstallQueryParams }; // create a clone of the valid params
            testParams[field] = wrongTypes[field]; // set a field to a wrong type

            expect(() => {
                parseAndValidateMerchantAuthToken(testParams);
            }).toThrow();
        });
    }
});
