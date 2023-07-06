import { parseAndValidateProcessTransactionMessage } from '../../../../src/models/sqs/process-transaction-message.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing the process transaction message model', () => {
    const validParams = {
        signature: 'some-id',
    };

    const fields = ['signature'];

    const wrongTypes = {
        signature: 123,
    };

    runValidParameterTest(parseAndValidateProcessTransactionMessage, validParams);
    runMissingFieldTests(parseAndValidateProcessTransactionMessage, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidateProcessTransactionMessage, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidateProcessTransactionMessage, validParams, fields);
});
