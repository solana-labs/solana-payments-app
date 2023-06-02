import { APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from 'aws-lambda';
import { createMechantAuthCookieHeader } from '../../utilities/clients/merchant-ui/create-cookie-header.utility.js';
import { requestErrorResponse } from '../../utilities/responses/request-response.utility.js';

export const login = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const testingMerchantId = 'HnWuBCBMZrug12qFG9t8b8KEoHbtGMq2X3EyyQZBLQqV';

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
            message: 'Successfully logged in.',
        }),
    };
};
