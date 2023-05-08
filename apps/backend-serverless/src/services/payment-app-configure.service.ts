import axios from "axios";
import { shopifyGraphQLEndpoint } from "../configs/endpoints.config.js";

const paymentAppConfigureMutation = `
    mutation PaymentsAppConfigure($externalHandle: String, $ready: Boolean!) {
        paymentsAppConfigure(externalHandle: $externalHandle, ready: $ready) {
          paymentsAppConfiguration {
            externalHandle
            ready
          }
          userErrors{
              field
              message
          }
        }
    }
`;

export const paymentAppConfigure = async (
  externalHandle: string,
  ready: boolean,
  shop: string,
  token: string
) => {
  const headers = {
    "content-type": "application/json",
    "X-Shopify-Access-Token": token,
  };
  const graphqlQuery = {
    query: paymentAppConfigureMutation,
    variables: {
      externalHandle,
      ready,
    },
  };

  try {
    const response = await axios({
      url: shopifyGraphQLEndpoint(shop),
      method: "POST",
      headers: headers,
      data: JSON.stringify(graphqlQuery),
    });

    return response.data;
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    }
  }
};
