import axios from "axios";
import { SHOPIFY_GRAPH_QL_ENDPOINT } from "../configs/endpoints.config";

const paymentSessionResolveMutation = `mutation paymentSessionResolve($id: ID!) {
    paymentSessionResolve(id: $id) {
        paymentSession {
            id
        }
        userErrors {
            field
            message
        }
    }
}
`;

const paymentSessionResolve = async (id: string) => {
  const headers = {
    "content-type": "application/graphql",
    "X-Shopify-Access-Token": "<token>",
  };
  const graphqlQuery = {
    operationName: "paymentSessionResolve",
    query: paymentSessionResolveMutation,
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
