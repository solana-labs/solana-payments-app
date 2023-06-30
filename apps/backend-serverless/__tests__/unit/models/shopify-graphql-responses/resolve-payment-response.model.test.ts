import { parseAndValidateResolvePaymentResponse } from '../../../../src/models/shopify-graphql-responses/resolve-payment-response.model.js';
import {
    runEmptyFieldTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';
import { createMockSuccessPaymentSessionResolveResponse } from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('unit testing resolve payment response model', () => {
    const validParams = createMockSuccessPaymentSessionResolveResponse();
    const fields = Object.keys(validParams);

    runValidParameterTest(parseAndValidateResolvePaymentResponse, validParams);
    runMissingFieldTests(parseAndValidateResolvePaymentResponse, validParams, fields);
    runEmptyFieldTests(parseAndValidateResolvePaymentResponse, validParams, fields);
});
