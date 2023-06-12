import { parseAndValidatePaymentAddressRequestBody } from '../../../../../src/models/clients/merchant-ui/payment-address-request.model.js';

describe('unit testing payment address request model', () => {
    const validRequestParams = {
        paymentAddress: 'some-address',
        name: 'some-name',
        acceptedTermsAndConditions: true,
        dismissCompleted: true,
    };

    it('valid merchant auth token body parsing', () => {
        const result = parseAndValidatePaymentAddressRequestBody(validRequestParams);

        expect(() => {
            parseAndValidatePaymentAddressRequestBody(validRequestParams);
        }).not.toThrow();
    });

    it('missing optional field', () => {
        const params = { ...validRequestParams };
        // @ts-ignore
        delete params.dismissCompleted;

        expect(() => {
            parseAndValidatePaymentAddressRequestBody(params);
        }).not.toThrow();
    });

    it('invalid field type', () => {
        const params = { ...validRequestParams, paymentAddress: 12345 }; // Invalid type
        console.log('params', params);
        expect(() => {
            parseAndValidatePaymentAddressRequestBody(params);
        }).toThrow();
    });
});
