import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { makePaymentAppConfigure } from '../../../../src/services/shopify/payment-app-configure.service.js';
import { createMockPaymentAppConfigureResponse } from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('unit testing payment app configure', () => {
    it('successful response', async () => {
        const mock = new MockAdapter(axios);
        const mockPaymentAppConfigureResponse = createMockPaymentAppConfigureResponse();
        mock.onPost().reply(200, mockPaymentAppConfigureResponse);
        const mockPaymentAppConfigure = makePaymentAppConfigure(axios);

        await expect(
            mockPaymentAppConfigure('mock-external-id', true, 'mock-shop', 'mock-token'),
        ).resolves.not.toThrow();
    });

    it('invalid response, missing external ready', async () => {
        const mock = new MockAdapter(axios);
        mock.onPost().reply(200, {
            data: {
                paymentsAppConfigure: {
                    paymentsAppConfiguration: {
                        extenalHandle: 'mock-external-id',
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
