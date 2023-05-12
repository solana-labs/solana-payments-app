import axios from 'axios';
import { shopifyGraphQLEndpoint } from '../../configs/endpoints.config.js';

const paymentSessionRejectMutation = `mutation paymentSessionReject($id: ID!, $reason: PaymentSessionRejectionReasonInput!) {
    paymentSessionReject(id: $id, reason: $reason) {
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

export const paymentSessionReject = async (id: string, reason: string, shop: string, token: string) => {
    const headers = {
        'content-type': 'application/graphql',
        'X-Shopify-Access-Token': token,
    };
    const graphqlQuery = {
        operationName: 'paymentSessionReject',
        query: paymentSessionRejectMutation,
        variables: {
            id,
            reason: {
                code: reason,
            },
        },
    };
    const response = await axios({
        url: shopifyGraphQLEndpoint(shop),
        method: 'POST',
        headers: headers,
        data: graphqlQuery,
    });
};
