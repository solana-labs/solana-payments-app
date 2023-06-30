import { parseAndValidateTransactionRequestBody } from '../../../../src/models/transaction-requests/transaction-request-body.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing the transaction request body model', () => {
    const validParams = {
        account: 'some-id',
    };

    const fields = Object.keys(validParams);

    const wrongTypes = {
        account: 123,
    };

    runValidParameterTest(parseAndValidateTransactionRequestBody, validParams);
    runMissingFieldTests(parseAndValidateTransactionRequestBody, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidateTransactionRequestBody, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidateTransactionRequestBody, validParams, fields);
});
