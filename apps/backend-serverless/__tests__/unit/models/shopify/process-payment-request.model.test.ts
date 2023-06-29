import { parseAndValidateShopifyPaymentInitiation } from '../../../../src/models/shopify/process-payment-request.model.js';

import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing shopify payment initiation model', () => {
    const validParams = {
        id: 'u0nwmSrNntjIWozmNslK5Tlq',
        gid: 'gid://shopify/PaymentSession/u0nwmSrNntjIWozmNslK5Tlq',
        group: 'rZNvy+1jH6Z+BcPqA5U5BSIcnUavBha3C63xBalm+xE=',
        amount: 123,
        currency: 'CAD',
        test: false,
        merchant_locale: 'en',
        payment_method: {
            type: 'offsite',
            data: {
                cancel_url: 'https://my-test-shop.com/1/checkouts/4c94d6f5b93f726a82dadfe45cdde432',
            },
        },
        proposed_at: '2020-07-13T00:00:00Z',
        customer: {
            email: 'buyer@example.com',
            phone_number: '5555555555',
            locale: 'fr',
            billing_address: {
                given_name: 'Alice',
                family_name: 'Smith',
                line1: '123 Street',
                line2: 'Suite B',
                city: 'Montreal',
                postal_code: 'H2Z 0B3',
                province: 'Quebec',
                country_code: 'CA',
                phone_number: '5555555555',
                company: '',
            },
            shipping_address: {
                given_name: 'Alice',
                family_name: 'Smith',
                line1: '123 Street',
                line2: 'Suite B',
                city: 'Montreal',
                postal_code: 'H2Z 0B3',
                province: 'Quebec',
                country_code: 'CA',
                phone_number: '5555555555',
                company: '',
            },
        },
        kind: 'sale',
    };

    const fields = [
        'id',
        'gid',
        'group',
        'amount',
        'currency',
        'test',
        'merchant_locale',
        'payment_method',
        'proposed_at',
        'kind',
        'customer',
    ];

    const wrongTypes = {
        id: 123,
        gid: 123,
        group: 123,
        amount: '123',
        currency: 123,
        test: 'false',
        merchant_locale: 123,
        payment_method: 123,
        proposed_at: 123,
        kind: 123,
        customer: 123,
    };

    runValidParameterTest(parseAndValidateShopifyPaymentInitiation, validParams);

    runMissingFieldTests(parseAndValidateShopifyPaymentInitiation, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidateShopifyPaymentInitiation, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidateShopifyPaymentInitiation, validParams, fields);

    // TEST inner objects
});
