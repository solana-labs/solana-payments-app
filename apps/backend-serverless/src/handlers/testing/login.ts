import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import { createMechantAuthCookieHeader } from '../../utilities/create-cookie-header.utility.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';

export const login = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    const testingMerchantId = 'testing-merchant-id';

    let merchantAuthCookieHeader: string;
    try {
        merchantAuthCookieHeader = createMechantAuthCookieHeader(testingMerchantId);
    } catch (error) {
        return requestErrorResponse(error);
    }

    return {
        statusCode: 200,
        headers: {
            'Set-Cookie': merchantAuthCookieHeader,
        },
        body: JSON.stringify({
            message: 'Successfully logged in',
        }),
    };
};
