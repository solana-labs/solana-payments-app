import { RefundRecordStatus } from '@prisma/client';
import { parseAndValidateRefundDataRequestParameters } from '../../../../../src/models/clients/merchant-ui/refund-data-request.model.js';

describe('unit testing refund data request model', () => {
    const fields = ['pageNumber', 'pageSize', 'refundStatus'];
    const validRequestParams = {
        pageNumber: 1,
        pageSize: 10,
        refundStatus: RefundRecordStatus.pending,
    };

    it('valid request parameters parsing', () => {
        expect(() => {
            parseAndValidateRefundDataRequestParameters(validRequestParams);
        }).not.toThrow();
    });

    for (const field of fields) {
        it(`missing required field ${field}`, () => {
            const testParams = { ...validRequestParams }; // create a clone of the valid params
            delete testParams[field]; // remove a field to simulate missing input

            expect(() => {
                parseAndValidateRefundDataRequestParameters(testParams);
            }).toThrow();
        });
    }

    const wrongTypes = {
        pageNumber: '1', // should be a number
        pageSize: '10', // should be a number
        // refundStatus is an enum and we can't easily generate an invalid value for it
    };

    for (const field of ['pageNumber', 'pageSize']) {
        // refundStatus isn't included because we can't easily generate an invalid value for it
        it(`invalid field type for ${field}`, () => {
            const testParams = { ...validRequestParams }; // create a clone of the valid params
            testParams[field] = wrongTypes[field]; // set a field to a wrong type

            expect(() => {
                parseAndValidateRefundDataRequestParameters(testParams);
            }).toThrow();
        });
    }

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
