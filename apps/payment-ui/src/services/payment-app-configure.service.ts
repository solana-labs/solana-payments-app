import axios from 'axios'
import { shopifyGraphQLEndpoint } from '../config/endpoints.config'

const paymentAppConfigureMutation = `mutation PaymentsAppConfigure($externalHandle: String, $ready: Boolean!) {
        paymentsAppConfigure(externalHandle: $externalHandle, ready: $ready) {
            userErrors{
                field
                message
            }
        }
    }
`

export const paymentAppConfigure = async (
    externalHandle: string,
    ready: boolean,
    shop: string,
    token: string
) => {
    const headers = {
        'content-type': 'application/json',
        'X-Shopify-Access-Token': token,
    }
    const graphqlQuery = {
        operationName: 'paymentAppConfigure',
        query: paymentAppConfigureMutation,
        variables: {
            externalHandle,
            ready,
        },
    }

    try {
    } catch (e) {
        if (e instanceof Error) {
            throw e
        }
    }

    const response = await axios({
        url: shopifyGraphQLEndpoint(shop),
        method: 'POST',
        headers: headers,
        data: JSON.stringify(graphqlQuery),
    })

    console.log(response.data)
}
