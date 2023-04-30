import axios from 'axios'
import { shopifyGraphQLEndpoint } from '../configs/endpoints.config.js'

const refundSessionRejectMutation = `mutation refundSessionReject($id: ID!, $reason: RefundSessionRejectionReasonInput!) {
    refundSessionReject(id: $id, reason: $reason) {
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
`

export const refundSessionReject = async (
    id: string,
    reason: string,
    shop: string,
    token: string
) => {
    const headers = {
        'content-type': 'application/graphql',
        'X-Shopify-Access-Token': token,
    }
    const graphqlQuery = {
        operationName: 'refundSessionReject',
        query: refundSessionRejectMutation,
        variables: {
            id,
            reason: {
                code: reason,
            },
        },
    }
    const response = await axios({
        url: shopifyGraphQLEndpoint(shop),
        method: 'POST',
        headers: headers,
        data: graphqlQuery,
    })
}
