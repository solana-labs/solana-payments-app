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

    const validParams2 = {
        pageNumber: '1',
        pageSize: '10',
    };

    const wrongTypes = {
        pageNumber: 'sdf',
        pageSize: 'sdf',
    };

    runValidParameterTest(parseAndValidatePaymentDataRequestParameters, validParams);
    runValidParameterTest(parseAndValidatePaymentDataRequestParameters, validParams2);
    runInvalidFieldTypeTests(parseAndValidatePaymentDataRequestParameters, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidatePaymentDataRequestParameters, validParams, fields);
});
