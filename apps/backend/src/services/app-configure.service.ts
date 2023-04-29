import axios from "axios";
import { SHOPIFY_GRAPH_QL_ENDPOINT } from "../configs/endpoints.config";

const paymentsAppConfigureMutation = `mutation PaymentsAppConfigure($externalHandle: String, $ready: Boolean!) {
    paymentsAppConfigure(ready: $ready) {
        paymentsAppConfiguration {
            externalHandle
            ready
        }
        userErrors {
            field
            message
        }
    }
}
`;

const paymentsAppConfigure = async (ready: boolean, externalHandle: string) => {
  const headers = {
    "content-type": "application/graphql",
    "X-Shopify-Access-Token": "<token>",
  };
  const graphqlQuery = {
    operationName: "paymentsAppConfigure",
    query: paymentsAppConfigureMutation,
    variables: {
      ready,
      externalHandle,
    },
  };
  const response = await axios({
    url: SHOPIFY_GRAPH_QL_ENDPOINT,
    method: "POST",
    headers: headers,
    data: graphqlQuery,
  });
};
