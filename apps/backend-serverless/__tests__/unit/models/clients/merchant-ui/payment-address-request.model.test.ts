import { parseAndValidatePaymentAddressRequestBody } from '../../../../../src/models/clients/merchant-ui/payment-address-request.model.js';
import {
    runInvalidFieldTypeTests,
    runValidParameterTest,
} from '../../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing payment address request model', () => {
    const fields = ['paymentAddress', 'name', 'acceptedTermsAndConditions', 'dismissCompleted'];
    const validParams = {
        paymentAddress: 'some-address',
        name: 'some-name',
        acceptedTermsAndConditions: true,
        dismissCompleted: true,
    };

    const wrongTypes = {
        paymentAddress: 123, // should be a string
        name: 123, // should be a string
        acceptedTermsAndConditions: 'true', // should be a boolean
        dismissCompleted: 'true', // should be a boolean
    };

    runValidParameterTest(parseAndValidatePaymentAddressRequestBody, validParams);
    runInvalidFieldTypeTests(parseAndValidatePaymentAddressRequestBody, validParams, fields, wrongTypes);
});
