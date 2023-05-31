import axios, { AxiosInstance } from 'axios';
import { shopifyGraphQLEndpoint } from '../../configs/endpoints.config.js';
import {
    RejectPaymentResponse,
    parseAndValidateResolvePaymentResponse,
} from '../../models/shopify-graphql-responses/reject-payment-response.model.js';

export enum PaymentSessionRejectionReason {
    saftyDependencyError = 'SAFETY_DEPENDENCY_ERROR', // Used in the case that we can't validate with TRM
    customerSafetyError = 'CUSTOMER_SAFETY_ERROR', // Used in the case that we can validate with TRM, but the wallet is risky
    internalServerError = 'INTERNAL_SERVER_ERROR', // Used in the case that we can validate with TRM, but the wallet is risky
    unknownError = 'UNKNOWN_ERROR', // Used in the case that we don't know why we couln't validate with TRM
}

const paymentSessionRejectMutation = `mutation PaymentSessionReject($id: ID!, $reason: PaymentSessionRejectionReasonInput!) {
    paymentSessionReject(id: $id, reason: $reason) {
        paymentSession {
            id
            state {
              ... on PaymentSessionStateRejected {
                code
                reason
                merchantMessage
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

export const makePaymentSessionReject =
    (axiosInstance: AxiosInstance) =>
    async (id: string, reason: string, shop: string, token: string): Promise<RejectPaymentResponse> => {
        const headers = {
            'content-type': 'application/graphql',
            'X-Shopify-Access-Token': token,
        };

        const graphqlQuery = {
            query: paymentSessionRejectMutation,
            variables: {
                id,
                reason: {
                    code: reason,
                },
            },
        };

        let paymentSessionRejectResponse: RejectPaymentResponse;

        try {
            const response = await axiosInstance({
                url: shopifyGraphQLEndpoint(shop),
                method: 'POST',
                headers: headers,
                data: JSON.stringify(graphqlQuery),
            });

            paymentSessionRejectResponse = parseAndValidateResolvePaymentResponse(response.data);
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error('Error rejecting payment session.');
            }
        }

        return paymentSessionRejectResponse;
    };
