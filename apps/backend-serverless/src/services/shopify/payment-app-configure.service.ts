import * as Sentry from '@sentry/node';
import axios from 'axios';
import https from 'https';
import { shopifyGraphQLEndpoint } from '../../configs/endpoints.config.js';
import { ShopifyResponseError } from '../../errors/shopify-response.error.js';
import {
    PaymentAppConfigureResponse,
    parseAndValidatePaymentAppConfigureResponse,
} from '../../models/shopify-graphql-responses/payment-app-configure-response.model.js';

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
            let response;
            if (process.env.NODE_ENV === 'development') {
                const agent = new https.Agent({
                    rejectUnauthorized: false,
                });

                response = await axiosInstance({
                    url: shopifyGraphQLEndpoint(shop),
                    method: 'POST',
                    headers: headers,
                    data: JSON.stringify(graphqlQuery),
                    httpsAgent: agent,
                });
            } else {
                response = await axiosInstance({
                    url: shopifyGraphQLEndpoint(shop),
                    method: 'POST',
                    headers: headers,
                    data: JSON.stringify(graphqlQuery),
                });
            }

            switch (response.status) {
                case 200:
                case 201:
                case 202:
                case 204:
                case 205:
                    console.log(response.data.data.paymentsAppConfigure.userErrors);
                    console.log(response.data.data.paymentsAppConfigure);
                    paymentAppConfigureResponse = parseAndValidatePaymentAppConfigureResponse(response.data);
                    break;
                default:
                    throw new ShopifyResponseError(
                        'non successful status code ' + response.status + '. data: ' + JSON.stringify(response.data)
                    );
            }
        } catch (error) {
            console.log(error);
            Sentry.captureException(error);
            throw error;
        }

        return paymentAppConfigureResponse;
    };
};
