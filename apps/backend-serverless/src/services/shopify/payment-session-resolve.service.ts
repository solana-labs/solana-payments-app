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

            if (response.status != 200) {
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
