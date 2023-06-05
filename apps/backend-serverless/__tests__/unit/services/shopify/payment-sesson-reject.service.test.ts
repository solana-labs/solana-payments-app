import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { makePaymentSessionReject } from '../../../../src/services/shopify/payment-session-reject.service.js';
import { createMockSuccessPaymentSessionRejectResponse } from '../../../../src/utilities/testing-helper/create-mock.utility.js';
import { PaymentSessionStateRejectedReason } from '../../../../src/models/shopify-graphql-responses/shared.model.js';

describe('unit testing payment session reject', () => {
    it('valid response', async () => {
        const mock = new MockAdapter(axios);
        const mockPaymentSessionRejectResponse = createMockSuccessPaymentSessionRejectResponse();
        mock.onPost().reply(200, mockPaymentSessionRejectResponse);
        const mockPaymentSessionReject = makePaymentSessionReject(axios);

        await expect(
            mockPaymentSessionReject('mock-id', PaymentSessionStateRejectedReason.risky, 'mock-shop', 'mock-token')
        ).resolves.not.toThrow();
    });

    it('invalid response, missing id', async () => {
        const mock = new MockAdapter(axios);
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

        await expect(
            mockPaymentSessionReject(
                'mock-id',
                PaymentSessionStateRejectedReason.processingError,
                'mock-shop',
                'mock-token'
            )
        ).rejects.toThrow();
    });
});
