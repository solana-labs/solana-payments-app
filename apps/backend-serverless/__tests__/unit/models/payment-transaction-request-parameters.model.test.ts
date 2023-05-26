import { parseAndValidatePaymentTransactionRequest } from '../../../src/models/payment-transaction-request-parameters.model.js';

describe('unit testing the payment transaction request parameters model', () => {
    it('valid payment transaction request parameters', () => {
        const validPaymentTransactionRequestParameters = {
            paymentId: 'some-id',
        };

        expect(() => {
            parseAndValidatePaymentTransactionRequest(validPaymentTransactionRequestParameters);
        }).not.toThrow();
    });

    it('invalid payment transaction request parameters', () => {
        const invalidPaymentTransactionRequestParameters = {
            id: 'some-id',
        };

        expect(() => {
            parseAndValidatePaymentTransactionRequest(invalidPaymentTransactionRequestParameters);
        }).toThrow();
    });
});
