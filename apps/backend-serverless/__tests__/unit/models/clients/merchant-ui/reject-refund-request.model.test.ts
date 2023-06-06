import { parseAndValidateRejectRefundRequest } from '../../../../../src/models/clients/merchant-ui/reject-refund-request.model.js';

describe('unit testing reject refund request model', () => {
    it('valid request parameters parsing', () => {
        const requestBody = {
            refundId: 'test-refund-id',
            merchantReason: 'test-reason',
        };

        expect(() => {
            parseAndValidateRejectRefundRequest(requestBody);
        }).not.toThrow();
    });

    it('should throw an error when refundId is missing', () => {
        const requestBody = {
            merchantReason: 'test-reason',
        };

        expect(() => {
            parseAndValidateRejectRefundRequest(requestBody);
        }).toThrow();
    });

    it('should throw an error when merchantReason is missing', () => {
        const requestBody = {
            refundId: 'test-refund-id',
        };

        expect(() => {
            parseAndValidateRejectRefundRequest(requestBody);
        }).toThrow();
    });

    it('should throw an error when refundId is empty', () => {
        const requestBody = {
            refundId: '',
            merchantReason: 'test-reason',
        };

        expect(() => {
            parseAndValidateRejectRefundRequest(requestBody);
        }).toThrow();
    });

    it('should throw an error when merchantReason is empty', () => {
        const requestBody = {
            refundId: 'test-refund-id',
            merchantReason: '',
        };

        expect(() => {
            parseAndValidateRejectRefundRequest(requestBody);
        }).toThrow();
    });

    it('should throw an error when refundId is not a string', () => {
        const requestBody = {
            refundId: 12345,
            merchantReason: 'test-reason',
        };

        expect(() => {
            parseAndValidateRejectRefundRequest(requestBody);
        }).toThrow();
    });

    it('should throw an error when merchantReason is not a string', () => {
        const requestBody = {
            refundId: 'test-refund-id',
            merchantReason: 12345,
        };

        expect(() => {
            parseAndValidateRejectRefundRequest(requestBody);
        }).toThrow();
    });
});
