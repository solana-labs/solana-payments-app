import { parseAndValidateRejectRefundResponse } from '../../../../src/models/shopify-graphql-responses/reject-refund-response.model.js';
import {
    runEmptyFieldTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';
import { createMockSuccessRefundSessionRejectResponse } from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('unit testing reject refund response model', () => {
    const validParams = createMockSuccessRefundSessionRejectResponse();
    const fields = ['data', 'extensions'];

    runValidParameterTest(parseAndValidateRejectRefundResponse, validParams);
    runMissingFieldTests(parseAndValidateRejectRefundResponse, validParams, fields);
    runEmptyFieldTests(parseAndValidateRejectRefundResponse, validParams, fields);
});
