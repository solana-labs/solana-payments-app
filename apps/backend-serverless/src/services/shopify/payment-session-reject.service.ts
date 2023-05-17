import axios from 'axios';
import { shopifyGraphQLEndpoint } from '../../configs/endpoints.config.js';

const paymentSessionRejectMutation = `mutation PaymentSessionReject($id: ID!, $reason: PaymentSessionRejectionReasonInput!) {
    paymentSessionReject(id: $id, reason: $reason) {
        paymentSession {
            id
            reason
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
        query: paymentSessionRejectMutation,
        variables: {
            id,
            reason: {
                code: reason,
            },
        },
    };

    let paymentSessionRejectResponse: PaymentSessionRejectResponse;

    try {
        const response = await axios({
            url: shopifyGraphQLEndpoint(shop),
            method: 'POST',
            headers: headers,
            data: JSON.stringify(graphqlQuery),
        });

        paymentSessionRejectResponse = parseAndValidatePaymentSessionRejectResponse(response.data);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Error rejecting payment session.');
        }
    }

    return paymentSessionRejectResponse;
};
