import axios from "axios";
import { shopifyGraphQLEndpoint } from "../configs/endpoints.config.js";
<<<<<<< HEAD
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
=======

const refundSessionRejectMutation = `mutation refundSessionReject($id: ID!, $reason: RefundSessionRejectionReasonInput!) {
    refundSessionReject(id: $id, reason: $reason) {
        paymentSession {
            id
        }
        userErrors {
            code
            field
            message
        }
>>>>>>> main
    }
}
`;

export const refundSessionReject = async (
  id: string,
<<<<<<< HEAD
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
=======
  reason: string,
  shop: string,
  token: string
) => {
  const headers = {
    "content-type": "application/graphql",
    "X-Shopify-Access-Token": token,
  };
  const graphqlQuery = {
    operationName: "refundSessionReject",
>>>>>>> main
    query: refundSessionRejectMutation,
    variables: {
      id,
      reason: {
<<<<<<< HEAD
        code,
        merchantMessage,
      },
    },
  };

=======
        code: reason,
      },
    },
  };
>>>>>>> main
  const response = await axios({
    url: shopifyGraphQLEndpoint(shop),
    method: "POST",
    headers: headers,
<<<<<<< HEAD
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
=======
    data: graphqlQuery,
  });
>>>>>>> main
};
