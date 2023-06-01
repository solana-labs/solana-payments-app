import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { makePaymentAppConfigure } from '../../../../src/services/shopify/payment-app-configure.service';
import { createMockPaymentAppConfigureResponse } from '../../../../src/utilities/testing-helper/create-mock.utility';

describe('unit testing payment app configure', () => {
    it('successful response', async () => {
        let mock = new MockAdapter(axios);
        const mockPaymentAppConfigureResponse = createMockPaymentAppConfigureResponse();
        mock.onPost().reply(200, mockPaymentAppConfigureResponse);
        const mockPaymentAppConfigure = makePaymentAppConfigure(axios);

        await expect(
            mockPaymentAppConfigure('mock-external-id', true, 'mock-shop', 'mock-token')
        ).resolves.not.toThrow();
    });

    it('invalid response, missing external ready', async () => {
        let mock = new MockAdapter(axios);
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
