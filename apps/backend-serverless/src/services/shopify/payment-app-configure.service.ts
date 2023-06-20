import axios from 'axios';
import { shopifyGraphQLEndpoint } from '../../configs/endpoints.config.js';
import {
    PaymentAppConfigureResponse,
    parseAndValidatePaymentAppConfigureResponse,
} from '../../models/shopify-graphql-responses/payment-app-configure-response.model.js';
import * as Sentry from '@sentry/node';
import { parseAndValidateRejectPaymentResponse } from '../../models/shopify-graphql-responses/reject-payment-response.model.js';
import { ShopifyResponseError } from '../../errors/shopify-response.error.js';

const paymentAppConfigureMutation = `
    mutation PaymentsAppConfigure($externalHandle: String, $ready: Boolean!) {
        paymentsAppConfigure(externalHandle: $externalHandle, ready: $ready) {
          paymentsAppConfiguration {
            externalHandle
            ready
          }
          userErrors{
              field
              message
          }
        }
    }
`;

export const makePaymentAppConfigure = (axiosInstance: typeof axios) => {
    return async (externalHandle: string, ready: boolean, shop: string, token: string) => {
        const headers = {
            'content-type': 'application/json',
            'X-Shopify-Access-Token': token,
        };
        const graphqlQuery = {
            query: paymentAppConfigureMutation,
            variables: {
                externalHandle,
                ready,
            },
        };

        let paymentAppConfigureResponse: PaymentAppConfigureResponse;

        try {
            const response = await axiosInstance({
                url: shopifyGraphQLEndpoint(shop),
                method: 'POST',
                headers: headers,
                data: JSON.stringify(graphqlQuery),
            });

            switch (response.status) {
                case 200:
                case 201:
                case 202:
                case 204:
                case 205:
                    paymentAppConfigureResponse = parseAndValidatePaymentAppConfigureResponse(response.data);
                    break;
                default:
                    const shopifyResponseError = new ShopifyResponseError(
                        'non successful status code ' + response.status + '. data: ' + JSON.stringify(response.data)
                    );
                    throw shopifyResponseError;
            }
        } catch (error) {
            console.log(error);
            Sentry.captureException(error);
            throw error;
        }

        return paymentAppConfigureResponse;
    };
};
