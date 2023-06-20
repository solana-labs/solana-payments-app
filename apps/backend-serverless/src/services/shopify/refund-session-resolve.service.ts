import { AxiosInstance } from 'axios';
import { shopifyGraphQLEndpoint } from '../../configs/endpoints.config.js';
import {
    ResolveRefundResponse,
    parseAndValidateResolveRefundResponse,
} from '../../models/shopify-graphql-responses/resolve-refund-response.model.js';
import * as Sentry from '@sentry/node';
import { ShopifyResponseError } from '../../errors/shopify-response.error.js';

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

export const makeRefundSessionResolve =
    (axiosInstance: AxiosInstance) =>
    async (id: string, shop: string, token: string): Promise<ResolveRefundResponse> => {
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

        let parsedResolveRefundResponse: ResolveRefundResponse;

        try {
            const response = await axiosInstance({
                url: shopifyGraphQLEndpoint(shop),
                method: 'POST',
                headers: headers,
                data: JSON.stringify(graphqlQuery),
            });

            switch (response.status) {
                case 200:
                case 201:
                case 202:
                case 204:
                case 205:
                    parsedResolveRefundResponse = parseAndValidateResolveRefundResponse(response.data);
                    break;
                default:
                    const shopifyResponseError = new ShopifyResponseError(
                        'non successful status code ' + response.status + '. data: ' + JSON.stringify(response.data)
                    );
                    throw shopifyResponseError;
            }
        } catch (error) {
            console.log(error);
            Sentry.captureException(error);
            throw error;
        }

        return parsedResolveRefundResponse;
    };
