import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const payment = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
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
