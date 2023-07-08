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
        pageNumber: '1',
        pageSize: '10',
        refundStatus: RefundStatusOption.open,
    };

    const wrongTypes = {
        pageNumber: 'sdf',
        pageSize: 'sdf',
        refundStatus: 1,
    };

    const wrongTypes2 = {
        pageNumber: 1,
        pageSize: 1,
        refundStatus: 1,
    };

    runValidParameterTest(parseAndValidateRefundDataRequestParameters, validParams);
    runInvalidFieldTypeTests(parseAndValidateRefundDataRequestParameters, validParams, fields, wrongTypes);
    runInvalidFieldTypeTests(parseAndValidateRefundDataRequestParameters, validParams, fields, wrongTypes2);
    runEmptyFieldTests(parseAndValidateRefundDataRequestParameters, validParams, fields);
});
