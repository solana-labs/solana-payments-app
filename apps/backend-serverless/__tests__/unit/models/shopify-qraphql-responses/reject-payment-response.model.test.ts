import { parseAndValidateResolvePaymentResponse } from '../../../../src/models/shopify-graphql-responses/reject-payment-response.model';

describe('unit testing reject payment response model', () => {
    it('valid reject payment response', () => {
        const validRejectPaymentResponse = {
            data: {
                paymentSessionReject: {
                    paymentSession: {
                        id: 'mock-shopify-id',
                        state: {
                            code: 'REJECTED',
                            reason: 'PROCESSING_ERROR',
                            merchantMessage: 'the payment didnt work',
                        },
                        nextAction: {
                            action: 'REDIRECT',
                            context: {
                                redirectUrl: 'https://mock-shopify-url.com',
                            },
                        },
                    },
                    userErrors: [],
                },
            },
            extensions: {},
        };

        expect(() => {
            parseAndValidateResolvePaymentResponse(validRejectPaymentResponse);
        }).not.toThrow();
    });

    it('invalid reject payment response, missing code', () => {
        const invalidRejectPaymentResponse = {
            data: {
                paymentSessionReject: {
                    paymentSession: {
                        id: 'mock-shopify-id',
                        state: {
                            reason: 'PROCESSING_ERROR',
                            merchantMessage: 'the payment didnt work',
                        },
                        nextAction: {
                            action: 'REDIRECT',
                            context: {
                                redirectUrl: 'https://mock-shopify-url.com',
                            },
                        },
                    },
                    userErrors: [],
                },
            },
            extensions: {},
        };

        expect(() => {
            parseAndValidateResolvePaymentResponse(invalidRejectPaymentResponse);
        }).toThrow();
    });
});
