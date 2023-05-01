import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {
    ShopifyPaymentInitiation,
    parseAndValidateShopifyPaymentInitiation,
} from '../models/process-payment-request.model.js'
import { requestErrorResponse } from '../utilities/request-response.utility.js'

export const payment = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    // the first thing I want to do is parse the body of the request
    // then i can take that info and determine if i need to
    // 1. create a new PaymentRecord
    // 2. reuse an existing PaymentRecord

    if (event.body == null) {
        return requestErrorResponse(new Error('Missing body.'))
    }

    let paymentInitiation: ShopifyPaymentInitiation

    try {
        paymentInitiation = parseAndValidateShopifyPaymentInitiation(
            JSON.parse(event.body)
        )
    } catch (error) {
        return requestErrorResponse(error)
    }

    const paymentUiUrl = process.env.PAYMENT_UI_URL

    if (paymentUiUrl == null) {
        return {
            statusCode: 500,
            body: JSON.stringify(
                {
                    message: 'Missing information.',
                },
                null,
                2
            ),
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                redirect_url: paymentUiUrl,
            },
            null,
            2
        ),
    }
}
