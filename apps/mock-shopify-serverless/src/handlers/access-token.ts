import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const accessToken = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            access_token: 'access-token-test',
            scope: 'write_payment_gateways,write_payment_sessions',
        }),
    };
};
