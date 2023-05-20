import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { makePaymentSessionResolve } from '../../../src/services/shopify/payment-session-resolve.service';
import exp from 'constants';
import { ResolvePaymentResponse } from '../../../src/models/shopify-graphql-responses/resolve-payment-response.model';

describe('payment session resolve', () => {
    it('a', async () => {
        let mock = new MockAdapter(axios);
        mock.onPost().reply(200, {
            data: {
                paymentSessionResolve: {
                    paymentSession: {
                        id: 'gid://shopify/PaymentSession/1234',
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

        expect(async () => {
            paymentSessionResolveResponse = await mockPaymentSessionResolve(
                'mock-id',
                'mock-shop.shopify.com',
                'mock-token'
            );
        }).not.toThrow();
    });
});
