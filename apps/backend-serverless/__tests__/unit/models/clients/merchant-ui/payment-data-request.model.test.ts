import { parseAndValidatePaymentDataRequestParameters } from '../../../../../src/models/clients/merchant-ui/payment-data-request.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runValidParameterTest,
} from '../../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing payment data request model', () => {
    const fields = ['pageNumber', 'pageSize'];
    const validParams = {
        pageNumber: 1,
        pageSize: 10,
    };

    const wrongTypes = {
        pageNumber: '1', // should be a number
        pageSize: '10', // should be a number
    };

    runValidParameterTest(parseAndValidatePaymentDataRequestParameters, validParams);
    runInvalidFieldTypeTests(parseAndValidatePaymentDataRequestParameters, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidatePaymentDataRequestParameters, validParams, fields);
});
