import { parseAndValidateGetAccountInfo } from '../../../../src/models/dependencies/get-account-info.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing helius get account info', () => {
    // using usdc mint and a token account
    const validParams = {
        jsonrpc: 'jsonrpc',
        result: {
            context: {
                apiVersion: 'apiVersion',
                slot: 1,
            },
            value: {
                data: {
                    parsed: {
                        info: {
                            isNative: true,
                            mint: 'mint',
                            owner: '11111111111111111111111111111111',
                            state: 'state',
                            tokenAmount: {
                                amount: 1,
                                decimals: 1,
                                uiAmount: 1,
                                uiAmountString: '1',
                            },
                        },
                        type: 'type',
                    },
                    program: 'program',
                    space: 1,
                },
                executable: false,
                lamports: 1,
                owner: '11111111111111111111111111111111',
                rentEpoch: 1,
            },
        },
        id: 1,
    };
    const fields = ['jsonrpc', 'result', 'id'];
    const wrongTypes = {
        jsonrpc: 1,
        result: {
            context: {
                apiVersion: 'apiVersion',
                slot: 1,
            },
            value: {
                data: {
                    parsed: {
                        info: {
                            isNative: true,
                            mint: 'mint',
                            owner: 'owner',
                            state: 'state',
                            tokenAmount: {
                                amount: 1,
                                decimals: 1,
                                uiAmount: 1,
                                uiAmountString: '1',
                            },
                        },
                        type: 'type',
                    },
                    program: 'program',
                    space: 1,
                },
                executable: false,
                lamports: 1,
                owner: 'owner',
                rentEpoch: 1,
            },
        },
        id: 'id',
    };

    runValidParameterTest(parseAndValidateGetAccountInfo, validParams);
    runInvalidFieldTypeTests(parseAndValidateGetAccountInfo, validParams, fields, wrongTypes);
    runMissingFieldTests(parseAndValidateGetAccountInfo, validParams, fields);
    runEmptyFieldTests(parseAndValidateGetAccountInfo, validParams, fields);
});
