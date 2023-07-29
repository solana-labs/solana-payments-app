import * as Sentry from '@sentry/node';
import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { shopifyGraphQLEndpoint } from '../../configs/endpoints.config.js';
import { ShopifyResponseError } from '../../errors/shopify-response.error.js';
import {
    ResolveRefundResponse,
    parseAndValidateResolveRefundResponse,
} from '../../models/shopify-graphql-responses/resolve-refund-response.model.js';

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

        let response;
        try {
            if (process.env.NODE_ENV === 'development') {
                const agent = new https.Agent({
                    rejectUnauthorized: false,
                });

                response = await axios({
                    url: shopifyGraphQLEndpoint(shop),
                    method: 'POST',
                    headers: headers,
                    data: JSON.stringify(graphqlQuery),
                    httpsAgent: agent,
                });
            } else {
                response = await axios({
                    url: shopifyGraphQLEndpoint(shop),
                    method: 'POST',
                    headers: headers,
                    data: JSON.stringify(graphqlQuery),
                });
            }

            switch (response.status) {
                case 200:
                case 201:
                case 202:
                case 204:
                case 205:
                    parsedResolveRefundResponse = parseAndValidateResolveRefundResponse(response.data);
                    break;
                default:
                    throw new ShopifyResponseError(
                        'non successful status code ' + response.status + '. data: ' + JSON.stringify(response.data)
                    );
            }
        } catch (error) {
            console.log(error);
            Sentry.captureException(error);
            throw error;
        }

        return parsedResolveRefundResponse;
    };
