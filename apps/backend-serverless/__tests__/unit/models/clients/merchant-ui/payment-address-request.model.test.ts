import { parseAndValidatePaymentAddressRequestBody } from '../../../../../src/models/clients/merchant-ui/payment-address-request.model.js';

describe('unit testing payment address request model', () => {
    it('valid merchant auth token body parsing', () => {
        const requestParams = {
            paymentAddress: 'some-address',
            name: 'some-name',
            acceptedTermsAndConditions: true,
            dismissCompleted: true,
        };

        expect(() => {
            parseAndValidatePaymentAddressRequestBody(requestParams);
        }).not.toThrow();
    });

    // it('invalid merchant auth token, missing id', () => {
    //     const requestParams = {
    //         iat: 'some-date',
    //         exp: 'some-date',
    //     };

    //     expect(() => {
    //         parseAndValidatePaymentAddressRequestBody(requestParams);
    //     }).toThrow();
    // });

    // it('invalid merchant auth token, missing iat', () => {
    //     const requestParams = {
    //         id: 'some-id',
    //         exp: 'some-date',
    //     };

    //     expect(() => {
    //         parseAndValidatePaymentAddressRequestBody(requestParams);
    //     }).toThrow();
    // });
});
