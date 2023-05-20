import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ResolvePaymentResponse } from '../../../../src/models/shopify-graphql-responses/resolve-payment-response.model';
import { makeRefundSessionResolve } from '../../../../src/services/shopify/refund-session-resolve.service';

describe('unit testing refund session resolve', () => {
    it('valid response', async () => {
        let mock = new MockAdapter(axios);
        mock.onPost().reply(200, {
            data: {
                refundSessionResolve: {
                    refundSession: {
                        id: 'mock-id',
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

        let refundSessionResolveResponse: ResolvePaymentResponse;

        expect(async () => {
            refundSessionResolveResponse = await mockRefundSessionResolve('mock-id', 'mock-shop', 'mock-token');
        }).not.toThrow();
    });
});
