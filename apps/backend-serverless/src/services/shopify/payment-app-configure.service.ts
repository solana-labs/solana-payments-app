import axios from 'axios';
import { shopifyGraphQLEndpoint } from '../../configs/endpoints.config.js';
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

export const paymentAppConfigure = async (externalHandle: string, ready: boolean, shop: string, token: string) => {
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
        const response = await axios({
            url: shopifyGraphQLEndpoint(shop),
            method: 'POST',
            headers: headers,
            data: JSON.stringify(graphqlQuery),
        });

        paymentAppConfigureResponse = parseAndValidatePaymentAppConfigureResponse(response.data);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Error configuring payment app.');
        }
    }

    return paymentAppConfigureResponse;
};
