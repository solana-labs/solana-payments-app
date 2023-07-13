import { parseAndValidatePaymentRequest } from '../../../../src/models/transaction-requests/payment-request-parameters.model.js';
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

    runValidParameterTest(parseAndValidatePaymentRequest, validParams);
    runMissingFieldTests(parseAndValidatePaymentRequest, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidatePaymentRequest, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidatePaymentRequest, validParams, fields);
});
