import { parseAndValidateAppRedirectQueryParams } from '../../../../src/models/shopify/redirect-query-params.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

// TEST Hmac
describe('unit testing redirect query parameters model', () => {
    const validParams = {
        code: 'some-code',
        hmac: 'some-hmac',
        shop: 'https://some-shop.myshopify.com',
        host: 'https://some-shop.myshopify.com',
        state: 'some-state',
        timestamp: 'some-timestamp',
    };
    const fields = ['code', 'shop', 'host', 'state', 'timestamp'];
    const wrongTypes = {
        code: 123,
        hmac: 123,
        shop: 123,
        host: 123,
        state: 123,
        timestamp: 123,
    };

    runValidParameterTest(parseAndValidateAppRedirectQueryParams, validParams);
    runMissingFieldTests(
        parseAndValidateAppRedirectQueryParams,
        validParams,
        fields.filter(field => field !== 'hmac')
    );
    runInvalidFieldTypeTests(parseAndValidateAppRedirectQueryParams, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidateAppRedirectQueryParams, validParams, fields);
});
