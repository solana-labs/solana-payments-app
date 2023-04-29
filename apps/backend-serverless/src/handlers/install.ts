import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const install = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: 'Install! Intall! Install!',
            },
            null,
            2
        ),
    }
}
