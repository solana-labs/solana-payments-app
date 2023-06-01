import { create } from 'lodash';
import { parseAndValidateRejectRefundResponse } from '../../../../src/models/shopify-graphql-responses/reject-refund-response.model';
import { createMockSuccessRefundSessionRejectResponse } from '../../../../src/utilities/testing-helper/create-mock.utility';

describe('unit testing reject refund response model', () => {
    it('valid reject refund response', () => {
        const validRejectRefundResponse = createMockSuccessRefundSessionRejectResponse();

        expect(() => {
            parseAndValidateRejectRefundResponse(validRejectRefundResponse);
        }).not.toThrow();
    });

    it('invalid reject refund response, missing id', () => {
        const invalidRejectRefundResponse = {
            data: {
                refundSessionReject: {
                    refundSession: {
                        state: {
                            reason: 'PROCESSING_ERROR',
                            merchantMessage: 'the refund didnt work',
                        },
                    },
                    userErrors: [],
                },
            },
            extensions: {},
        };

        expect(() => {
            parseAndValidateRejectRefundResponse(invalidRejectRefundResponse);
        }).toThrow();
    });
});
