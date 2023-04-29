import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const redirect = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: 'Redirect! Redirect! Redirect!',
            },
            null,
            2
        ),
    }
}
