import { parseAndValidatePaymentAppConfigureResponse } from '../../../../src/models/shopify-graphql-responses/payment-app-configure-response.model.js';

describe('unit testing payment app configure model', () => {
    it('valid payment app configure response', () => {
        const validPaymentAppConfigureResponse = {
            data: {
                paymentsAppConfigure: {
                    paymentsAppConfiguration: {
                        externalHandle: 'mock-internal-id',
                        ready: true,
                    },
                    userErrors: [],
                },
            },
            extensions: {},
        };

        expect(() => {
            parseAndValidatePaymentAppConfigureResponse(validPaymentAppConfigureResponse);
        }).not.toThrow();
    });

    it('invalid payment app configure response, missing ready', () => {
        const invalidPaymentAppConfigureResponse = {
            data: {
                paymentsAppConfigure: {
                    paymentsAppConfiguration: {
                        externalHandle: 'mock-internal-id',
                    },
                    userErrors: [],
                },
            },
            extensions: {},
        };

        expect(() => {
            parseAndValidatePaymentAppConfigureResponse(invalidPaymentAppConfigureResponse);
        }).toThrow();
    });
});
