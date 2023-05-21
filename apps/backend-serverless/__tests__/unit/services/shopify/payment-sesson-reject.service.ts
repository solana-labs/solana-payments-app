import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { makePaymentSessionReject } from '../../../../src/services/shopify/payment-session-reject.service';
import { RejectPaymentResponse } from '../../../../src/models/shopify-graphql-responses/reject-payment-response.model';

describe('unit testing payment session reject', () => {
    it('valid response', async () => {
        let mock = new MockAdapter(axios);
        mock.onPost().reply(200, {
            data: {
                paymentSessionReject: {
                    paymentSession: {
                        id: 'mock-id',
                        state: {
                            code: 'REJECTED',
                            merchantMessage: 'mock-reason',
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
        });
        const mockPaymentSessionReject = makePaymentSessionReject(axios);

        await expect(
            mockPaymentSessionReject('mock-id', 'mock-reason', 'mock-shop', 'mock-token')
        ).resolves.not.toThrow();
    });

    it('invalid response, missing id', async () => {
        let mock = new MockAdapter(axios);
        mock.onPost().reply(200, {
            data: {
                paymentSessionReject: {
                    paymentSession: {
                        state: {
                            code: 'REJECTED',
                            merchantMessage: 'mock-reason',
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
        });
        const mockPaymentSessionReject = makePaymentSessionReject(axios);

        await expect(mockPaymentSessionReject('mock-id', 'mock-reason', 'mock-shop', 'mock-token')).rejects.toThrow();
    });
});
