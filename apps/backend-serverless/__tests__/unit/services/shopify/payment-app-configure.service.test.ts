import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { makePaymentAppConfigure } from '../../../../src/services/shopify/payment-app-configure.service';
import { PaymentAppConfigureResponse } from '../../../../src/models/shopify-graphql-responses/payment-app-configure-response.model';

describe('unit testing payment app configure', () => {
    it('successful response', async () => {
        let mock = new MockAdapter(axios);
        mock.onPost().reply(200, {
            data: {
                paymentsAppConfigure: {
                    paymentsAppConfiguration: {
                        externalHandle: 'mock-external-id',
                        ready: true,
                    },
                    userErrors: [],
                },
            },
            extensions: {},
        });
        const mockPaymentAppConfigure = makePaymentAppConfigure(axios);

        await expect(
            mockPaymentAppConfigure('mock-external-id', true, 'mock-shop', 'mock-token')
        ).resolves.not.toThrow();
    });

    it('invalid response, missing external handle', async () => {
        let mock = new MockAdapter(axios);
        mock.onPost().reply(200, {
            data: {
                paymentsAppConfigure: {
                    paymentsAppConfiguration: {
                        ready: true,
                    },
                    userErrors: [],
                },
            },
            extensions: {},
        });
        const mockPaymentAppConfigure = makePaymentAppConfigure(axios);

        await expect(mockPaymentAppConfigure('mock-external-id', true, 'mock-shop', 'mock-token')).rejects.toThrow();
    });
});
