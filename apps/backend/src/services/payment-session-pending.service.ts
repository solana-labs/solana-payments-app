import axios from "axios";
import { SHOPIFY_GRAPH_QL_ENDPOINT } from "../configs/endpoints.config";

const paymentSessionPendingMutation = `mutation paymentSessionPending($id: ID!, $pendingExpiresAt: DateTime!, $reason: PaymentSessionStatePendingReason!) {
    paymentSessionPending(
        id: $id
        pendingExpiresAt: $pendingExpiresAt
        reason: $reason
    ) {
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

const paymentSessionPending = async (id: string) => {
  const headers = {
    "content-type": "application/graphql",
    "X-Shopify-Access-Token": "<token>",
  };
  const graphqlQuery = {
    operationName: "paymentSessionPending",
    query: paymentSessionPendingMutation,
    variables: {
      id,
    },
  };
  const response = await axios({
    url: SHOPIFY_GRAPH_QL_ENDPOINT,
    method: "POST",
    headers: headers,
    data: graphqlQuery,
  });
};
