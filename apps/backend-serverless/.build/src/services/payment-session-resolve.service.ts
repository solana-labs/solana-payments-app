import axios from 'axios'
import { shopifyGraphQLEndpoint } from '../configs/endpoints.config'

const paymentSessionResolveMutation = `mutation paymentSessionResolve($id: ID!) {
    paymentSessionResolve(id: $id) {
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

export const paymentSessionResolve = async (
    id: string,
    shop: string,
    token: string
) => {
    const headers = {
        'content-type': 'application/graphql',
        'X-Shopify-Access-Token': token,
    }
    const graphqlQuery = {
        operationName: 'paymentSessionResolve',
        query: paymentSessionResolveMutation,
        variables: {
            id,
        },
    }
    const response = await axios({
        url: shopifyGraphQLEndpoint(shop),
        method: 'POST',
        headers: headers,
        data: graphqlQuery,
    })
}
