import {
    runEmptyFieldTests,
    runEmptyFieldTestsInArray,
    runInvalidFieldTypeTests,
    runInvalidFieldTypeTestsInArray,
    runMissingFieldTests,
    runMissingFieldTestsInArray,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

import { parseAndValidateHeliusBalance } from '../../../../src/models/dependencies/helius-balance.model.js';

describe('unit testing helius balance model', () => {
    // using usdc mint and a token account
    const validParams = {
        tokens: [
            {
                mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                amount: 123,
                decimals: 2,
                tokenAccount: '4tnXNcqwPjMMtGiB4UBiaTCAkWXjY8oCcVgH1BaDZc2o',
            },
            // Add more valid tokens as needed
        ],
        nativeBalance: 123,
    };
    const fields = ['mint', 'amount', 'decimals', 'tokenAccount'];
    const wrongTypes = {
        mint: 123, // should be a string
        amount: '123', // should be a number
        decimals: '2', // should be a number
        tokenAccount: 123, // should be a string
    };
    const wrongTypes2 = {
        mint: true, // should be a string
        amount: false, // should be a number
        decimals: true, // should be a number
        tokenAccount: false, // should be a string
    };

    runValidParameterTest(parseAndValidateHeliusBalance, validParams);

    runMissingFieldTestsInArray(parseAndValidateHeliusBalance, validParams, 'tokens', fields);
    runInvalidFieldTypeTestsInArray(parseAndValidateHeliusBalance, validParams, 'tokens', fields, wrongTypes);
    runInvalidFieldTypeTestsInArray(parseAndValidateHeliusBalance, validParams, 'tokens', fields, wrongTypes2);
    runEmptyFieldTestsInArray(parseAndValidateHeliusBalance, validParams, 'tokens', fields);

    // Also test for missing or invalid 'nativeBalance'
    runMissingFieldTests(parseAndValidateHeliusBalance, validParams, ['nativeBalance']);
    runInvalidFieldTypeTests(parseAndValidateHeliusBalance, validParams, ['nativeBalance'], { nativeBalance: '123' });
    runInvalidFieldTypeTests(parseAndValidateHeliusBalance, validParams, ['nativeBalance'], { nativeBalance: false });
    runEmptyFieldTests(parseAndValidateHeliusBalance, validParams, ['nativeBalance']);
});
