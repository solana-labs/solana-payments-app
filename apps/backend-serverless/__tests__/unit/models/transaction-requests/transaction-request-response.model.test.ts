import { parseAndValidateTransactionRequestResponse } from '../../../../src/models/transaction-requests/transaction-request-response.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing the payment transaction request parameters model', () => {
    const validParams = {
        transaction: 'some-transaction',
        message: 'some-message',
    };

    const fields = Object.keys(validParams);

    const wrongTypes = {
        transaction: 123,
        message: 123,
    };

    runValidParameterTest(parseAndValidateTransactionRequestResponse, validParams);
    runMissingFieldTests(
        parseAndValidateTransactionRequestResponse,
        validParams,
        fields.filter(field => field !== 'message')
    );
    runInvalidFieldTypeTests(parseAndValidateTransactionRequestResponse, validParams, fields, wrongTypes);
    runEmptyFieldTests(
        parseAndValidateTransactionRequestResponse,
        validParams,
        fields.filter(field => field !== 'message')
    );
});
