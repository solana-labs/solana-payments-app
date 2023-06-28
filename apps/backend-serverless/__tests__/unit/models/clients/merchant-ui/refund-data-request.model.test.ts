import { parseAndValidateRefundDataRequestParameters } from '../../../../../src/models/clients/merchant-ui/refund-data-request.model.js';
import { RefundStatusOption } from '../../../../../src/utilities/clients/merchant-ui/create-refund-response.utility.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runValidParameterTest,
} from '../../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing refund data request model', () => {
    const fields = ['pageNumber', 'pageSize', 'refundStatus'];
    const validParams = {
        pageNumber: 1,
        pageSize: 10,
        refundStatus: RefundStatusOption.open,
    };

    const wrongTypes = {
        pageNumber: '1', // should be a number
        pageSize: '10', // should be a number
        refundStatus: 'clopen',
    };

    runValidParameterTest(parseAndValidateRefundDataRequestParameters, validParams);
    runInvalidFieldTypeTests(parseAndValidateRefundDataRequestParameters, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidateRefundDataRequestParameters, validParams, fields);
});
