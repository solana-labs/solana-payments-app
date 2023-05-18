import { parseAndValidateRejectRefundResponse } from '../../../../src/models/shopify-graphql-responses/reject-refund-response.model';

describe('unit testing reject refund response model', () => {
    it('valid reject refund response', () => {
        const validRejectRefundResponse = {
            data: {
                refundSessionReject: {
                    refundSession: {
                        id: 'mock-shopify-id',
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
