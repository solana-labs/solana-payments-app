import { parseAndValidateMerchantAuthToken } from '../../../../../src/models/clients/merchant-ui/merchant-auth-token.model.js';
import { runCommonTests } from '../../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing the merchant auth token model', () => {
    const fields = ['id', 'iat', 'exp'];
    const validInstallQueryParams = {
        id: 'some-id',
        iat: 123,
        exp: 123,
    };

    const wrongTypes = {
        id: 123, // should be a string
        iat: '123', // should be a number
        exp: '123', // should be a number
    };

    runCommonTests(parseAndValidateMerchantAuthToken, validInstallQueryParams, fields, wrongTypes);
});
