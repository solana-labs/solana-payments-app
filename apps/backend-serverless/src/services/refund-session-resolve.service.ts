import axios from 'axios'
import { shopifyGraphQLEndpoint } from '../configs/endpoints.config.js'
import {
    ResolveRefundResponse,
    parseAndValidateResolveRefundResponse,
} from '../models/resolve-refund-response.model.js'

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

export const refundSessionResolve = async (
    id: string,
    shop: string,
    token: string
) => {
    const headers = {
        'content-type': 'application/graphql',
        'X-Shopify-Access-Token': token,
    }
    const graphqlQuery = {
        operationName: 'refundSessionResolve',
        query: refundSessionResolveMutation,
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

    if (response.status != 200) {
        throw new Error('Error resolving refund session.')
    }

    let parsedResolveRefundResponse: ResolveRefundResponse

    try {
        parsedResolveRefundResponse = parseAndValidateResolveRefundResponse(
            response.data
        )
    } catch (error) {
        if (error instanceof Error) {
            throw error
        } else {
            throw new Error(
                'Could not parse resolve refund response. Unknown Reason.'
            )
        }
    }

    return parsedResolveRefundResponse
}
