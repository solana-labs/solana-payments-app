import axios from 'axios';
import { shopifyGraphQLEndpoint } from '../../configs/endpoints.config.js';
import { parseAndValidatePaymentAppConfigureResponse } from '../../models/shopify-graphql-responses/payment-app-configure-response.model.js';

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

        const response = await axiosInstance({
            url: shopifyGraphQLEndpoint(shop),
            method: 'POST',
            headers: headers,
            data: JSON.stringify(graphqlQuery),
        });

        const paymentAppConfigureResponse = parseAndValidatePaymentAppConfigureResponse(response.data);

        return paymentAppConfigureResponse;
    };
};
