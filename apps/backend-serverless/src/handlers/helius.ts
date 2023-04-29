import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const helius = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: 'Helius! Helius! Helius!',
            },
            null,
            2
        ),
    }
}
