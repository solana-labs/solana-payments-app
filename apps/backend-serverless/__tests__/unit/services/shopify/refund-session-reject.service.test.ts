import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { makeRefundSessionReject } from '../../../../src/services/shopify/refund-session-reject.service';
import { RejectRefundResponse } from '../../../../src/models/shopify-graphql-responses/reject-refund-response.model';

describe('unit testing refund session reject', () => {
    it('valid response', async () => {
        let mock = new MockAdapter(axios);
        mock.onPost().reply(200, {
            data: {
                refundSessionReject: {
                    refundSession: {
                        id: 'gid://shopify/PaymentSession/1234',
                        state: {
                            code: 'SUCCESS',
                        },
                    },
                    userErrors: [],
                },
            },
            extensions: {},
        });
        const mockRefundSessionReject = makeRefundSessionReject(axios);

        let refundSessionRejectResponse: RejectRefundResponse;

        expect(async () => {
            refundSessionRejectResponse = await mockRefundSessionReject(
                'mock-id',
                'REJECTED',
                'mock-message',
                'mock-shop',
                'mock-token'
            );
        }).not.toThrow();
    });
});
