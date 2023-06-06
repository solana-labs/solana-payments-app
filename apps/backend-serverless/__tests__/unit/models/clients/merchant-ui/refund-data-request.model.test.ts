import { parseAndValidateRefundDataRequestParameters } from '../../../../../src/models/clients/merchant-ui/refund-data-request.model.js';
import { RefundRecordStatus } from '@prisma/client';

describe('unit testing refund data request model', () => {
    it('valid request parameters parsing', () => {
        const requestParams = {
            pageNumber: 1,
            pageSize: 10,
            refundStatus: RefundRecordStatus.pending,
        };

        expect(() => {
            parseAndValidateRefundDataRequestParameters(requestParams);
        }).not.toThrow();
    });

    it('should throw an error for negative pageNumber', () => {
        const requestParams = {
            pageNumber: -1,
            pageSize: 10,
            refundStatus: RefundRecordStatus.pending,
        };

        expect(() => {
            parseAndValidateRefundDataRequestParameters(requestParams);
        }).toThrow();
    });

    it('should throw an error for negative pageSize', () => {
        const requestParams = {
            pageNumber: 1,
            pageSize: -10,
            refundStatus: RefundRecordStatus.pending,
        };

        expect(() => {
            parseAndValidateRefundDataRequestParameters(requestParams);
        }).toThrow();
    });

    it('should throw an error for invalid refundStatus', () => {
        const requestParams = {
            pageNumber: 1,
            pageSize: 10,
            refundStatus: 'invalid-status',
        };

        expect(() => {
            parseAndValidateRefundDataRequestParameters(requestParams);
        }).toThrow();
    });
});
