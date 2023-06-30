import { parseAndValidateRefundTransactionRequest } from '../../../../src/models/transaction-requests/refund-transaction-request.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing the refund transaction request model', () => {
    const validParams = {
        refundId: 'some-id',
    };

    const fields = Object.keys(validParams);

    const wrongTypes = {
        refundId: 123,
    };

    runValidParameterTest(parseAndValidateRefundTransactionRequest, validParams);
    runMissingFieldTests(parseAndValidateRefundTransactionRequest, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidateRefundTransactionRequest, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidateRefundTransactionRequest, validParams, fields);
});
