import axios from 'axios';
import { shopifyGraphQLEndpoint } from '../../configs/endpoints.config.js';
import {
    PaymentAppConfigureResponse,
    parseAndValidatePaymentAppConfigureResponse,
} from '../../models/shopify-graphql-responses/payment-app-configure-response.model.js';
import { parse } from 'path';

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

            paymentAppConfigureResponse = parseAndValidatePaymentAppConfigureResponse(response.data);
        } catch (e) {
            if (e instanceof Error) {
                throw e;
            } else {
                throw new Error('Error configuring payment app.');
            }
        }

        return paymentAppConfigureResponse;
    };
};
