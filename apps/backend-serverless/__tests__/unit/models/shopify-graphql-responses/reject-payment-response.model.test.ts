import { parseAndValidateRejectPaymentResponse } from '../../../../src/models/shopify-graphql-responses/reject-payment-response.model.js';
import {
    runEmptyFieldTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';
import { createMockSuccessPaymentSessionRejectResponse } from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('unit testing reject payment response model', () => {
    const validParams = createMockSuccessPaymentSessionRejectResponse();
    const fields = Object.keys(validParams);

    runValidParameterTest(parseAndValidateRejectPaymentResponse, validParams);
    runMissingFieldTests(parseAndValidateRejectPaymentResponse, validParams, fields);
    runEmptyFieldTests(parseAndValidateRejectPaymentResponse, validParams, fields);
});
