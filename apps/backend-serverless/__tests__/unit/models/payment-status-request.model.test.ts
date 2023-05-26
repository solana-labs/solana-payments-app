import { parseAndValidatePaymentStatusRequest } from '../../../src/models/payment-status-request.model.js';

describe('unit testing the payment status request model', () => {
    it('valid payment status request parameters', () => {
        const validPaymentStatusRequestParameters = {
            paymentId: 'some-id',
            language: 'en',
        };

        expect(() => {
            parseAndValidatePaymentStatusRequest(validPaymentStatusRequestParameters);
        }).not.toThrow();
    });

    it('invalid payment status request parameters', () => {
        const invalidPaymentStatusRequestParameters = {
            id: 'some-id',
            language: 'en',
        };

        expect(() => {
            parseAndValidatePaymentStatusRequest(invalidPaymentStatusRequestParameters);
        }).toThrow();
    });

    it('invalid payment status request parameters, missing language', () => {
        const invalidPaymentStatusRequestParameters = {
            paymentId: 'some-id',
        };

        expect(() => {
            parseAndValidatePaymentStatusRequest(invalidPaymentStatusRequestParameters);
        }).toThrow();
    });
});
