import { AxiosInstance } from 'axios';
import { shopifyGraphQLEndpoint } from '../../configs/endpoints.config.js';
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

        const response = await axiosInstance({
            url: shopifyGraphQLEndpoint(shop),
            method: 'POST',
            headers: headers,
            data: JSON.stringify(graphqlQuery),
        });

        if (response.status != 200) {
            throw new Error('Could not reject refund session with Shopify');
        }

        let rejectRefundResponse: RejectRefundResponse;

        rejectRefundResponse = parseAndValidateRejectRefundResponse(response.data);

        return rejectRefundResponse;
    };
