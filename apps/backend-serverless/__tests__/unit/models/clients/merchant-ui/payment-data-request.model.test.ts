import { parseAndValidatePaymentDataRequestParameters } from '../../../../../src/models/clients/merchant-ui/payment-data-request.model.js';

describe('unit testing payment data request model', () => {
    it('valid request parameters parsing', () => {
        const requestParams = {
            pageNumber: 1,
            pageSize: 10,
        };

        expect(() => {
            parseAndValidatePaymentDataRequestParameters(requestParams);
        }).not.toThrow();
    });

    it('should throw an error for negative pageNumber', () => {
        const requestParams = {
            pageNumber: -1,
            pageSize: 10,
        };

        expect(() => {
            parseAndValidatePaymentDataRequestParameters(requestParams);
        }).toThrow();
    });
});
