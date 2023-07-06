import { parseAndValidateSolanaPayInfoMessage } from '../../../../src/models/sqs/solana-pay-info-message.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing solana pay info message model', () => {
    const validParams = {
        account: 'some-id',
        paymentRecordId: 'some-id',
    };

    const fields = ['account', 'paymentRecordId'];

    const wrongTypes = {
        account: 123,
        paymentRecordId: 123,
    };

    runValidParameterTest(parseAndValidateSolanaPayInfoMessage, validParams);
    runMissingFieldTests(parseAndValidateSolanaPayInfoMessage, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidateSolanaPayInfoMessage, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidateSolanaPayInfoMessage, validParams, fields);
});
