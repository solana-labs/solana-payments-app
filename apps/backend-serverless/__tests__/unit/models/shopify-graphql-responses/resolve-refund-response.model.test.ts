import { parseAndValidateResolveRefundResponse } from '../../../../src/models/shopify-graphql-responses/resolve-refund-response.model.js';
import { createMockSuccessRefundSessionResolveResponse } from '../../../../src/utilities/testing-helper/create-mock.utility.js';

import {
    runEmptyFieldTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing resolve refund response model', () => {
    const validParams = createMockSuccessRefundSessionResolveResponse();
    const fields = Object.keys(validParams);

    runValidParameterTest(parseAndValidateResolveRefundResponse, validParams);
    runMissingFieldTests(parseAndValidateResolveRefundResponse, validParams, fields);
    runEmptyFieldTests(parseAndValidateResolveRefundResponse, validParams, fields);
});
