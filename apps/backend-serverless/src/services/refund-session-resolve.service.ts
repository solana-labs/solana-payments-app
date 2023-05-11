import axios from 'axios';
import { shopifyGraphQLEndpoint } from '../configs/endpoints.config.js';
import {
    ResolveRefundResponse,
    parseAndValidateResolveRefundResponse,
} from '../models/shopify-graphql-responses/resolve-refund-response.model.js';

const refundSessionResolveMutation = `mutation RefundSessionResolve($id: ID!) {
    refundSessionResolve(id: $id) {
      refundSession {
        id
        state {
          ... on RefundSessionStateResolved {
            code
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

export const refundSessionResolve = async (id: string, shop: string, token: string) => {
    const headers = {
        'content-type': 'application/json',
        'X-Shopify-Access-Token': token,
    };
    const graphqlQuery = {
        query: refundSessionResolveMutation,
        variables: {
            id,
        },
    };
    const response = await axios({
        url: shopifyGraphQLEndpoint(shop),
        method: 'POST',
        headers: headers,
        data: JSON.stringify(graphqlQuery),
    });

    if (response.status != 200) {
        throw new Error('Error resolving refund session.');
    }

    let parsedResolveRefundResponse: ResolveRefundResponse;

    try {
        parsedResolveRefundResponse = parseAndValidateResolveRefundResponse(response.data);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Could not parse resolve refund response. Unknown Reason.');
        }
    }

    return parsedResolveRefundResponse;
};
