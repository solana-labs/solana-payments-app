import { APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from 'aws-lambda';
import { createMechantAuthCookieHeader } from '../../utilities/create-cookie-header.utility.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';

export const login = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const testingMerchantId = 'merchantId';

    let merchantAuthCookieHeader: string;
    try {
        merchantAuthCookieHeader = createMechantAuthCookieHeader(testingMerchantId);
    } catch (error) {
        return requestErrorResponse(error);
    }

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Set-Cookie': merchantAuthCookieHeader,
        },
        body: JSON.stringify({
            message: 'Successfully logged in.',
        }),
    };
};
