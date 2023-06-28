import { parseAndValidatePaymentAddressRequestBody } from '../../../../../src/models/clients/merchant-ui/payment-address-request.model.js';

describe('unit testing payment address request model', () => {
    const fields = ['paymentAddress', 'name', 'acceptedTermsAndConditions', 'dismissCompleted'];
    const validRequestParams = {
        paymentAddress: 'some-address',
        name: 'some-name',
        acceptedTermsAndConditions: true,
        dismissCompleted: true,
    };

    it('valid payment address request body parsing', () => {
        expect(() => {
            parseAndValidatePaymentAddressRequestBody(validRequestParams);
        }).not.toThrow();
    });

    for (const field of ['paymentAddress', 'name', 'acceptedTermsAndConditions']) {
        // dismissCompleted is optional, so it's not included
        it(`missing required field ${field}`, () => {
            const testParams = { ...validRequestParams }; // create a clone of the valid params
            delete testParams[field]; // remove a field to simulate missing input

            expect(() => {
                parseAndValidatePaymentAddressRequestBody(testParams);
            }).toThrow();
        });
    }

    const wrongTypes = {
        paymentAddress: 123, // should be a string
        name: 123, // should be a string
        acceptedTermsAndConditions: 'true', // should be a boolean
        dismissCompleted: 'true', // should be a boolean
    };

    for (const field of fields) {
        it(`invalid field type for ${field}`, () => {
            const testParams = { ...validRequestParams }; // create a clone of the valid params
            testParams[field] = wrongTypes[field]; // set a field to a wrong type

            expect(() => {
                parseAndValidatePaymentAddressRequestBody(testParams);
            }).toThrow();
        });
    }
});
