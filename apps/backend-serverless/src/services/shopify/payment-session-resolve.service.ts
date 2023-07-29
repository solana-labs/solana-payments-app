import * as Sentry from '@sentry/node';
import axios from 'axios';
import https from 'https';
import { shopifyGraphQLEndpoint } from '../../configs/endpoints.config.js';
import { ShopifyResponseError } from '../../errors/shopify-response.error.js';
import {
    ResolvePaymentResponse,
    parseAndValidateResolvePaymentResponse,
} from '../../models/shopify-graphql-responses/resolve-payment-response.model.js';

const paymentSessionResolveMutation = `mutation PaymentSessionResolve($id: ID!) {
    paymentSessionResolve(id: $id) {
        paymentSession {
            id
            state {
              ... on PaymentSessionStateResolved {
                code
              }
            }
            nextAction {
              action
              context {
                ... on PaymentSessionActionsRedirect {
                  redirectUrl
                }
              }
            }
        }
        userErrors {
            field
            message
        }
    }
}
`;

export const makePaymentSessionResolve = (axiosInstance: typeof axios) => {
    return async (id: string, shop: string, token: string): Promise<ResolvePaymentResponse> => {
        const headers = {
            'content-type': 'application/json',
            'X-Shopify-Access-Token': token,
        };

        const graphqlQuery = {
            query: paymentSessionResolveMutation,
            variables: {
                id,
            },
        };

        let resolvePaymentResponse: ResolvePaymentResponse;

        let response;
        try {
            if (process.env.NODE_ENV === 'development') {
                const agent = new https.Agent({
                    rejectUnauthorized: false,
                });

                response = await axios({
                    url: shopifyGraphQLEndpoint(shop),
                    method: 'POST',
                    headers: headers,
                    data: JSON.stringify(graphqlQuery),
                    httpsAgent: agent,
                });
            } else {
                response = await axios({
                    url: shopifyGraphQLEndpoint(shop),
                    method: 'POST',
                    headers: headers,
                    data: JSON.stringify(graphqlQuery),
                });
            }

            // TODO: For all of these graphql requests, check for the specific error codes here
            // https://shopify.dev/docs/api/payments-apps#status_and_error_codes

            switch (response.status) {
                case 200:
                case 201:
                case 202:
                case 204:
                case 205:
                    resolvePaymentResponse = parseAndValidateResolvePaymentResponse(response.data);
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

        return resolvePaymentResponse;
    };
};
