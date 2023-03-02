import axios from 'axios'
import { SHOPIFY_GRAPH_QL_ENDPOINT } from '../configs/endpoints.config'

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
`

const paymentSessionReject = async (id: string, reason: string) => {
    const headers = {
        'content-type': 'application/graphql',
        'X-Shopify-Access-Token': '<token>',
    }
    const graphqlQuery = {
        operationName: 'paymentSessionReject',
        query: paymentSessionRejectMutation,
        variables: {
            id,
            reason: {
                code: reason,
            },
        },
    }
    const response = await axios({
        url: SHOPIFY_GRAPH_QL_ENDPOINT,
        method: 'POST',
        headers: headers,
        data: graphqlQuery,
    })
}
