import { parseAndValidateBalanceParameters } from '../../../../../src/models/clients/payment-ui/balance-request-parameters.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing the payment status request model', () => {
    const fields = ['pubkey'];
    const validParams = {
        pubkey: '9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b',
    };

    const wrongTypes = {
        pubkey: 123, // should be a string
    };
    const wrongTypes2 = {
        pubkey: 'random', // should be a pubkey string
    };

    runValidParameterTest(parseAndValidateBalanceParameters, validParams);
    runMissingFieldTests(parseAndValidateBalanceParameters, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidateBalanceParameters, validParams, fields, wrongTypes);
    runInvalidFieldTypeTests(parseAndValidateBalanceParameters, validParams, fields, wrongTypes2);
    runEmptyFieldTests(parseAndValidateBalanceParameters, validParams, fields);
});
