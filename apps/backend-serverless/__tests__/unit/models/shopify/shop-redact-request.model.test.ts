import { parseAndValidateShopRedactRequestBody } from '../../../../src/models/shopify/shop-redact-request.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing shop redact request model', () => {
    const validParams = {
        shop_id: '123456',
        shop_domain: 'some-shop.myshopify.com',
    };
    const fields = Object.keys(validParams);
    const wrongTypes = {
        shop_id: 123,
        shop_domain: 123,
    };

    runValidParameterTest(parseAndValidateShopRedactRequestBody, validParams);
    runMissingFieldTests(parseAndValidateShopRedactRequestBody, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidateShopRedactRequestBody, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidateShopRedactRequestBody, validParams, fields);
});
