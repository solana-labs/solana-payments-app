import { parseAndValidateAdminDataResponse } from '../../../../src/models/shopify-graphql-responses/admin-data.response.model.js';
import { createMockAdminDataResponse } from '../../../../src/utilities/testing-helper/create-mock.utility.js';

import {
    runEmptyFieldTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing payment app configure model', () => {
    const validParams = createMockAdminDataResponse();

    const fields = Object.keys(validParams);

    runValidParameterTest(parseAndValidateAdminDataResponse, validParams);
    runMissingFieldTests(parseAndValidateAdminDataResponse, validParams, fields);
    runEmptyFieldTests(parseAndValidateAdminDataResponse, validParams, fields);
});
