import { parseAndValidateAdminDataResponse } from '../../../../src/models/shopify-graphql-responses/admin-data.response.model.js';
import { createMockAdminDataResponse } from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('unit testing payment app configure model', () => {
    it('valid payment app configure response', () => {
        const validAdminDataResponse = createMockAdminDataResponse();

        expect(() => {
            parseAndValidateAdminDataResponse(validAdminDataResponse);
        }).not.toThrow();
    });
});
