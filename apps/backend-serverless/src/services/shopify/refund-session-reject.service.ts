import * as Sentry from '@sentry/node';
import { AxiosInstance } from 'axios';
import { shopifyGraphQLEndpoint } from '../../configs/endpoints.config';
import { ShopifyResponseError } from '../../errors/shopify-response.error';
import {
    RejectRefundResponse,
    parseAndValidateRejectRefundResponse,
} from '../../models/shopify-graphql-responses/reject-refund-response.model';

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
