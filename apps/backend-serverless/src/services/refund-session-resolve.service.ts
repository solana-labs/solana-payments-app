import axios from "axios";
import { shopifyGraphQLEndpoint } from "../configs/endpoints.config.js";

const refundSessionResolveMutation = `mutation refundSessionResolve($id: ID!) {
    refundSessionResolve(id: $id) {
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

export const refundSessionResolve = async (
  id: string,
  shop: string,
  token: string
) => {
  const headers = {
    "content-type": "application/graphql",
    "X-Shopify-Access-Token": token,
  };
  const graphqlQuery = {
    operationName: "refundSessionResolve",
    query: refundSessionResolveMutation,
    variables: {
      id,
    },
  };
  const response = await axios({
    url: shopifyGraphQLEndpoint(shop),
    method: "POST",
    headers: headers,
    data: graphqlQuery,
  });
};
