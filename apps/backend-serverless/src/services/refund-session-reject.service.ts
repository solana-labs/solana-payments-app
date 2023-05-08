import axios from "axios";
import { shopifyGraphQLEndpoint } from "../configs/endpoints.config.js";
import {
  RejectRefundResponse,
  parseAndValidateRejectRefundResponse,
} from "../models/shopify-graphql-responses/reject-refund-response.model.js";

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

export const refundSessionReject = async (
  id: string,
  code: string,
  merchantMessage: string,
  shop: string,
  token: string
): Promise<RejectRefundResponse> => {
  const headers = {
    "content-type": "application/json",
    "X-Shopify-Access-Token": token,
  };
  const graphqlQuery = {
    query: refundSessionRejectMutation,
    variables: {
      id,
      reason: {
        code,
        merchantMessage,
      },
    },
  };

  const response = await axios({
    url: shopifyGraphQLEndpoint(shop),
    method: "POST",
    headers: headers,
    data: JSON.stringify(graphqlQuery),
  });

  if (response.status != 200) {
    throw new Error("Could not reject refund session with Shopify");
  }

  let rejectRefundResponse: RejectRefundResponse;

  try {
    rejectRefundResponse = parseAndValidateRejectRefundResponse(response.data);
  } catch (error) {
    throw new Error();
  }

  return rejectRefundResponse;
};
