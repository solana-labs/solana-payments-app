import axios from 'axios'
import { shopifyGraphQLEndpoint } from '../configs/endpoints.config.js'

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
`

export const refundSessionResolve = async (
    id: string,
    shop: string,
    token: string
) => {
    const headers = {
        'content-type': 'application/json',
        'X-Shopify-Access-Token': token,
    }
    const graphqlQuery = {
        query: refundSessionResolveMutation,
        variables: {
            id,
        },
    }
    const response = await axios({
        url: shopifyGraphQLEndpoint(shop),
        method: 'POST',
        headers: headers,
        data: JSON.stringify(graphqlQuery),
    })
}
