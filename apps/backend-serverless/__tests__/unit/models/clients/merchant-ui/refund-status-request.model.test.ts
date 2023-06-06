import { parseAndValidateRefundStatusRequest } from '../../../../../src/models/clients/merchant-ui/refund-status-request.model.js';

describe('unit testing refund status request model', () => {
    it('valid request parameters parsing', () => {
        const requestParams = {
            shopId: 'test-shop-id',
        };

        expect(() => {
            parseAndValidateRefundStatusRequest(requestParams);
        }).not.toThrow();
    });

    it('should throw an error when shopId is missing', () => {
        const requestParams = {};

        expect(() => {
            parseAndValidateRefundStatusRequest(requestParams);
        }).toThrow();
    });

    it('should throw an error when shopId is empty', () => {
        const requestParams = {
            shopId: '',
        };

        expect(() => {
            parseAndValidateRefundStatusRequest(requestParams);
        }).toThrow();
    });

    it('should throw an error when shopId is not a string', () => {
        const requestParams = {
            shopId: 12345,
        };

        expect(() => {
            parseAndValidateRefundStatusRequest(requestParams);
        }).toThrow();
    });
});
