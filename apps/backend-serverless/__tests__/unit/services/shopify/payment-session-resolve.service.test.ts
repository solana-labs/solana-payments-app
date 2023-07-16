import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { makePaymentSessionResolve } from '../../../../src/services/shopify/payment-session-resolve.service.js';
import { createMockSuccessPaymentSessionResolveResponse } from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('unit testing payment session resolve', () => {
    it('valid response', async () => {
        const mock = new MockAdapter(axios);
        const mockPaymentSessionResolveResponse = createMockSuccessPaymentSessionResolveResponse();
        mock.onPost().reply(200, mockPaymentSessionResolveResponse);
        const mockPaymentSessionResolve = makePaymentSessionResolve(axios);

        await expect(
            mockPaymentSessionResolve('mock-id', 'mock-shop.shopify.com', 'mock-token'),
        ).resolves.not.toThrow();
    });

    it('invalid response, missing id', async () => {
        const mock = new MockAdapter(axios);
        const mockPaymentSessionResolveResponse = createMockSuccessPaymentSessionResolveResponse();
        mock.onPost().reply(200, {
            data: {
                paymentSessionResolve: {
                    paymentSession: {
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

        await expect(mockPaymentSessionResolve('mock-id', 'mock-shop.shopify.com', 'mock-token')).rejects.toThrow();
    });
});
