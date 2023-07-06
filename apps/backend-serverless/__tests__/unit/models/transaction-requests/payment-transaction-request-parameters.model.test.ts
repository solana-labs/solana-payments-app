import { parseAndValidatePaymentTransactionRequest } from '../../../../src/models/transaction-requests/payment-transaction-request-parameters.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing the payment transaction request parameters model', () => {
    const validParams = {
        paymentId: 'some-id',
    };

    const fields = ['paymentId'];

    const wrongTypes = {
        paymentId: 123,
    };

    runValidParameterTest(parseAndValidatePaymentTransactionRequest, validParams);
    runMissingFieldTests(parseAndValidatePaymentTransactionRequest, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidatePaymentTransactionRequest, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidatePaymentTransactionRequest, validParams, fields);
});
