import { parseAndValidateShopifyRequestHeaders } from '../../../../src/models/shopify/shopify-request-headers.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing shopify request headers model', () => {
    const validParams = {
        'shopify-shop-domain': 'some-shop.myshopify.com',
        'shopify-request-id': 'some-hmac',
        'shopify-api-version': 'some-api-version',
    };

    const fields = Object.keys(validParams);
    const wrongTypes = {
        'shopify-shop-domain': 123,
        'shopify-request-id': 123,
        'shopify-api-version': 123,
    };

    runValidParameterTest(parseAndValidateShopifyRequestHeaders, validParams);
    runMissingFieldTests(parseAndValidateShopifyRequestHeaders, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidateShopifyRequestHeaders, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidateShopifyRequestHeaders, validParams, fields);
});
