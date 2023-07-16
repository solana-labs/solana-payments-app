import { parseAndValidateAppInstallQueryParms } from '../../../../src/models/shopify/install-query-params.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

// TEST Hmac
describe('Install Query Params Model', () => {
    const validParams = {
        hmac: 'some-hmac',
        shop: 'https://some-shop.myshopify.com',
        host: 'some-host',
        timestamp: 'some-timestamp',
    };

    const fields = ['hmac', 'shop', 'host', 'timestamp'];

    const wrongTypes = {
        hmac: 123, // should be a string
        shop: 123, // should be a string
        host: 123, // should be a string
        timestamp: 123, // should be a string
    };

    runValidParameterTest(parseAndValidateAppInstallQueryParms, validParams);
    runMissingFieldTests(
        parseAndValidateAppInstallQueryParms,
        validParams,
        fields.filter(field => field !== 'hmac'),
    );
    runInvalidFieldTypeTests(parseAndValidateAppInstallQueryParms, validParams, fields, wrongTypes);
    runEmptyFieldTests(
        parseAndValidateAppInstallQueryParms,
        validParams,
        fields.filter(field => field !== 'hmac'),
    );
});
