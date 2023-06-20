import axios from 'axios';
import { shopifyGraphQLEndpoint } from '../../configs/endpoints.config.js';
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

        try {
            const response = await axiosInstance({
                url: shopifyGraphQLEndpoint(shop),
                method: 'POST',
                headers: headers,
                data: JSON.stringify(graphqlQuery),
            });

            // TODO: For all of these graphql requests, check for the specific error codes here
            // https://shopify.dev/docs/api/payments-apps#status_and_error_codes

            switch (response.status) {
                case 200:
                    // good
                    break;
                case 201:
                    // good
                    break;
                case 202:
                    // good
                    break;
                case 204:
                    // good
                    break;
                case 205:
                    // good
                    break;
                case 401:
                // bad
                case 402:
                    // bad
                    break;

                case 403:
                    // bad
                    break;

                case 404:
                    // bad
                    break;

                case 405:
                    // bad
                    break;

                case 406:
                    // bad
                    break;

                case 409:
                    // bad
                    break;

                case 415:
                    // bad
                    break;

                case 422:
                    // bad
                    break;

                case 429:
                    // bad
                    break;

                case 500:
                    // bad
                    break;

                case 501:
                    // bad
                    break;

                case 502:
                    // bad
                    break;

                case 503:
                    // bad
                    break;

                case 504:
                    // bad
                    break;

                case 530:
                    // bad
                    break;

                case 540:
                    // bad
                    break;
            }

            // 429 Too Many Requests
            // The request was not accepted because the application has exceeded the rate limit. Learn more about Shopify’s API rate limits.
            // 430 Shopify Security Rejection
            // The request was not accepted because the request might be malicious, and Shopify has responded by rejecting it to protect the app from any possible attacks.
            // 500 Internal Server Error
            // An internal error occurred in Shopify. Simplify or retry your request. If the issue persists, then please record any error codes, timestamps and contact Partner Support so that Shopify staff can investigate.
            // 501 Not Implemented
            // The requested endpoint is not available on that particular shop, e.g. requesting access to a Shopify Plus–only API on a non-Plus shop. This response may also indicate that this endpoint is reserved for future use.
            // 502 Bad Gateway
            // The server, while acting as a gateway or proxy, received an invalid response from the upstream server. A 502 error isn't typically something you can fix. It usually requires a fix on the web server or the proxies that you're trying to get access through.
            // 503 Service Unavailable
            // The server is currently unavailable. Check the Shopify status page for reported service outages.
            // 504 Gateway Timeout
            // The request couldn't complete in time. Shopify waits up to 10 seconds for a response. Try breaking it down in multiple smaller requests.
            // 530 Origin DNS Error
            // Cloudflare can't resolve the requested DNS record. Check the Shopify status page for reported service outages.
            // 540 Temporarily Disabled

            if (response.status == 200) {
                throw new Error('Error resolving payment session.');
            }

            resolvePaymentResponse = parseAndValidateResolvePaymentResponse(response.data);
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error('Error resolving payment session.');
            }
        }

        return resolvePaymentResponse;
    };
};
