import { parseAndValidatePaymentStatusRequest } from '../../../src/models/payment-status-request.model.js';

describe('unit testing the payment transaction request parameters model', () => {
    it('valid payment transaction request parameters', () => {
        const validPaymentTransactionRequestParameters = {
            paymentId: 'some-id',
        };

        expect(() => {
            parseAndValidatePaymentStatusRequest(validPaymentTransactionRequestParameters);
        }).not.toThrow();
    });

    it('invalid payment transaction request parameters', () => {
        const invalidPaymentTransactionRequestParameters = {
            id: 'some-id',
        };

        expect(() => {
            parseAndValidatePaymentStatusRequest(invalidPaymentTransactionRequestParameters);
        }).toThrow();
    });
});
