import * as Sentry from '@sentry/node';
import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { shopifyGraphQLEndpoint } from '../../configs/endpoints.config.js';
import { ShopifyResponseError } from '../../errors/shopify-response.error.js';
import {
    RejectRefundResponse,
    parseAndValidateRejectRefundResponse,
} from '../../models/shopify-graphql-responses/reject-refund-response.model.js';

const refundSessionRejectMutation = `mutation RefundSessionReject($id: ID!, $reason: RefundSessionRejectionReasonInput!) {
    refundSessionReject(id: $id, reason: $reason) {
      refundSession {
        id
        state {
          ... on RefundSessionStateRejected {
            code
            reason
            merchantMessage
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

export const makeRefundSessionReject =
    (axiosInstance: AxiosInstance) =>
    async (
        id: string,
        code: string,
        merchantMessage: string | undefined,
        shop: string,
        token: string
    ): Promise<RejectRefundResponse> => {
        const headers = {
            'content-type': 'application/json',
            'X-Shopify-Access-Token': token,
        };

        const reason = {
            code,
        };

        if (merchantMessage != undefined) {
            reason['merchantMessage'] = merchantMessage;
        }

        const graphqlQuery = {
            query: refundSessionRejectMutation,
            variables: {
                id,
                reason: reason,
            },
        };

        let rejectRefundResponse: RejectRefundResponse;

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

            switch (response.status) {
                case 200:
                case 201:
                case 202:
                case 204:
                case 205:
                    rejectRefundResponse = parseAndValidateRejectRefundResponse(response.data);
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

        return rejectRefundResponse;
    };
