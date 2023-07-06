import { parseAndValidateShopifyRefundInitiation } from '../../../../src/models/shopify/process-refund.request.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing shopify refund initiation model', () => {
    const validParams = {
        id: 'PJUG6iB0xU7czy1ZN3xEwn4o',
        gid: 'gid://shopify/RefundSession/PJUG6iB0xU7czy1ZN3xEwn4o',
        payment_id: 'u0nwmSrNntjIWozmNslK5Tlq',
        amount: 123,
        currency: 'CAD',
        test: false,
        merchant_locale: 'en',
        proposed_at: '2021-07-13T00:00:00Z',
    };

    const fields = ['id', 'gid', 'payment_id', 'amount', 'currency', 'test', 'merchant_locale', 'proposed_at'];
    const wrongTypes = {
        id: 123,
        gid: 123,
        payment_id: 123,
        amount: '123',
        currency: 123,
        test: 'false',
        merchant_locale: 123,
        proposed_at: 123,
    };

    runValidParameterTest(parseAndValidateShopifyRefundInitiation, validParams);
    runMissingFieldTests(parseAndValidateShopifyRefundInitiation, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidateShopifyRefundInitiation, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidateShopifyRefundInitiation, validParams, fields);
});
