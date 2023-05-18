import { parseAndValidateResolveRefundResponse } from '../../../../src/models/shopify-graphql-responses/resolve-refund-response.model';

describe('unit testing resolve refund response model', () => {
    it('valid resolve refund response', () => {
        const validResolveRefundResponse = {
            data: {
                refundSessionResolve: {
                    refundSession: {
                        id: 'mock-shopify-id',
                        state: {
                            reason: 'SUCCESS',
                            merchantMessage: 'the refund was successful',
                        },
                    },
                    userErrors: [],
                },
            },
            extensions: {},
        };

        expect(() => {
            parseAndValidateResolveRefundResponse(validResolveRefundResponse);
        }).not.toThrow();
    });

    it('invalid resolve refund response, missing id', () => {
        const invalidResolveRefundResponse = {
            data: {
                refundSessionResolve: {
                    refundSession: {
                        state: {
                            merchantMessage: 'the refund was successful',
                        },
                    },
                    userErrors: [],
                },
            },
            extensions: {},
        };

        expect(() => {
            parseAndValidateResolveRefundResponse(invalidResolveRefundResponse);
        }).toThrow();
    });
});
