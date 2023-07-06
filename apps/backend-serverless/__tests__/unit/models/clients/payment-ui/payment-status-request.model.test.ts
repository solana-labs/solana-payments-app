import { parseAndValidatePaymentStatusRequest } from '../../../../../src/models/clients/payment-ui/payment-status-request.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing the payment status request model', () => {
    const fields = ['paymentId', 'language'];
    const validParams = {
        paymentId: 'some-id',
        language: 'en',
    };

    const wrongTypes = {
        paymentId: 123, // should be a string
        language: 123, // should be a string
    };

    runValidParameterTest(parseAndValidatePaymentStatusRequest, validParams);
    runMissingFieldTests(parseAndValidatePaymentStatusRequest, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidatePaymentStatusRequest, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidatePaymentStatusRequest, validParams, fields);
});
