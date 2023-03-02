import axios from 'axios'
import { SHOPIFY_GRAPH_QL_ENDPOINT } from '../configs/endpoints.config'

const refundSessionResolveMutation = `mutation refundSessionResolve($id: ID!) {
    refundSessionResolve(id: $id) {
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

const refundSessionResolve = async (id: string) => {
    const headers = {
        'content-type': 'application/graphql',
        'X-Shopify-Access-Token': '<token>',
    }
    const graphqlQuery = {
        operationName: 'refundSessionResolve',
        query: refundSessionResolveMutation,
        variables: {
            id,
        },
    }
    const response = await axios({
        url: SHOPIFY_GRAPH_QL_ENDPOINT,
        method: 'POST',
        headers: headers,
        data: graphqlQuery,
    })
}
