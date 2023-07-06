import { parseAndValidateAccessTokenResponse } from '../../../../src/models/shopify/access-token-response.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('Merchant Testing Suite', () => {
    const validParams = {
        access_token: 'abcd-efgh',
        scope: 'read_products,write_products',
    };
    const fields = ['access_token', 'scope'];
    const wrongTypes = {
        access_token: 123, // should be a string
        scope: 123, // should be a string
    };

    runValidParameterTest(parseAndValidateAccessTokenResponse, validParams);
    runMissingFieldTests(parseAndValidateAccessTokenResponse, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidateAccessTokenResponse, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidateAccessTokenResponse, validParams, fields);
});
