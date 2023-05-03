import axios from 'axios'
import { shopifyGraphQLEndpoint } from '../configs/endpoints.config.js'
import {
    ResolvePaymentResponse,
    parseAndValidateResolvePaymentResponse,
} from '../models/resolve-payment-response.model.js'

const paymentSessionResolveMutation = `mutation PaymentSessionResolve($id: ID!) {
    paymentSessionResolve(id: $id) {
        paymentSession {
            id
            state {
              ... on PaymentSessionStateResolved {
                code
              }
            }
            nextAction {
              action
              context {
                ... on PaymentSessionActionsRedirect {
                  redirectUrl
                }
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

export const paymentSessionResolve = async (
    id: string,
    shop: string,
    token: string
): Promise<ResolvePaymentResponse> => {
    const headers = {
        'content-type': 'application/json',
        'X-Shopify-Access-Token': token,
    }
    const graphqlQuery = {
        query: paymentSessionResolveMutation,
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

    if (response.status != 200) {
        throw new Error('Error resolving payment session.')
    }

    console.log('smuckkk')

    console.log(response.data)

    let resolvePaymentResponse: ResolvePaymentResponse

    try {
        resolvePaymentResponse = parseAndValidateResolvePaymentResponse(
            response.data
        )
    } catch (error) {
        throw error
    }

    return resolvePaymentResponse
}
