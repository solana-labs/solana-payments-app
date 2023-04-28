import axios from "axios";
import { SHOPIFY_GRAPH_QL_ENDPOINT } from "../configs/endpoints.config";

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
    }
}
`;

const refundSessionReject = async (id: string, reason: string) => {
  const headers = {
    "content-type": "application/graphql",
    "X-Shopify-Access-Token": "<token>",
  };
  const graphqlQuery = {
    operationName: "refundSessionReject",
    query: refundSessionRejectMutation,
    variables: {
      id,
      reason: {
        code: reason,
      },
    },
  };
  const response = await axios({
    url: SHOPIFY_GRAPH_QL_ENDPOINT,
    method: "POST",
    headers: headers,
    data: graphqlQuery,
  });
};
