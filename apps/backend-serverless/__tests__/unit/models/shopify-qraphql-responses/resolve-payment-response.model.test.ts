import { parseAndValidateResolvePaymentResponse } from '../../../../src/models/shopify-graphql-responses/resolve-payment-response.model';

describe('unit testing resolve payment response model', () => {
    it('valid resolve payment response', () => {
        const validResolvePaymentResponse = {
            data: {
                paymentSessionResolve: {
                    paymentSession: {
                        id: 'mock-shopify-id',
                        state: {
                            code: 'SUCCESS',
                            reason: 'SUCCESS',
                            merchantMessage: 'the payment was successful',
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
            parseAndValidateResolvePaymentResponse(validResolvePaymentResponse);
        }).not.toThrow();
    });

    it('invalid resolve payment response, missing reason', () => {
        const invalidResolvePaymentResponse = {
            data: {
                paymentSessionResolve: {
                    paymentSession: {
                        id: 'mock-shopify-id',
                        state: {
                            merchantMessage: 'the payment was successful',
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
            parseAndValidateResolvePaymentResponse(invalidResolvePaymentResponse);
        }).toThrow();
    });
});
