import { parseAndValidatePaymentAppConfigureResponse } from '../../../../src/models/shopify-graphql-responses/payment-app-configure-response.model.js';
import {
    runEmptyFieldTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';
import { createMockPaymentAppConfigureResponse } from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('unit testing payment app configure model', () => {
    const validParams = createMockPaymentAppConfigureResponse();

    const fields = ['data', 'extensions'];

    runValidParameterTest(parseAndValidatePaymentAppConfigureResponse, validParams);
    runMissingFieldTests(parseAndValidatePaymentAppConfigureResponse, validParams, fields);
    runEmptyFieldTests(parseAndValidatePaymentAppConfigureResponse, validParams, fields);
});
