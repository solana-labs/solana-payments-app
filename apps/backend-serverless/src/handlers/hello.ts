import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const hello = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 500,
        body: JSON.stringify(
            {
                message: 'Hello, world!',
            },
            null,
            2
        ),
    };
};
