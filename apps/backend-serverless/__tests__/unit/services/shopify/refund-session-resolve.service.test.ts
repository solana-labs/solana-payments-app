import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ResolvePaymentResponse } from '../../../../src/models/shopify-graphql-responses/resolve-payment-response.model';
import { makeRefundSessionResolve } from '../../../../src/services/shopify/refund-session-resolve.service';
import { createMockSuccessRefundSessionResolveResponse } from '../../../../src/utilities/testing-helper/create-mock.utility';

describe('unit testing refund session resolve', () => {
    it('valid response', async () => {
        let mock = new MockAdapter(axios);
        const mockRefundSessionResolveResponse = createMockSuccessRefundSessionResolveResponse();
        mock.onPost().reply(200, mockRefundSessionResolveResponse);
        const mockRefundSessionResolve = makeRefundSessionResolve(axios);

        await expect(mockRefundSessionResolve('mock-id', 'mock-shop', 'mock-token')).resolves.not.toThrow();
    });

    it('invalid response, missing id', async () => {
        let mock = new MockAdapter(axios);
        mock.onPost().reply(200, {
            data: {
                refundSessionResolve: {
                    refundSession: {
                        state: {
                            code: 'SUCCESS',
                        },
                    },
                    userErrors: [],
                },
            },
            extensions: {},
        });
        const mockRefundSessionResolve = makeRefundSessionResolve(axios);

        await expect(mockRefundSessionResolve('mock-id', 'mock-shop', 'mock-token')).rejects.toThrow();
    });
});
