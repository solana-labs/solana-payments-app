import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { makePaymentSessionResolve } from '../../../../src/services/shopify/payment-session-resolve.service';
import { ResolvePaymentResponse } from '../../../../src/models/shopify-graphql-responses/resolve-payment-response.model';

describe('unit testing payment session resolve', () => {
    it('valid response', async () => {
        let mock = new MockAdapter(axios);
        mock.onPost().reply(200, {
            data: {
                paymentSessionResolve: {
                    paymentSession: {
                        id: 'mock-id',
                        state: {
                            code: 'SUCCESS',
                        },
                        nextAction: { action: 'redirect', context: { redirectUrl: 'https://example.com' } },
                    },
                    userErrors: [],
                },
            },
            extensions: {},
        });
        const mockPaymentSessionResolve = makePaymentSessionResolve(axios);

        let paymentSessionResolveResponse: ResolvePaymentResponse;

        await expect(
            mockPaymentSessionResolve('mock-id', 'mock-shop.shopify.com', 'mock-token')
        ).resolves.not.toThrow();
    });
});
