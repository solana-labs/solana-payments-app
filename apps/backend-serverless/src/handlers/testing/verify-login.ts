import { APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from 'aws-lambda';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import { withAuth } from '../../utilities/token-authenticate.utility.js';

export const verifyLogin = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const testingMerchantId = 'testing-merchant-id';

    try {
        const merchantAuthToken = withAuth(event.cookies);
        if (merchantAuthToken.id != testingMerchantId) {
            return requestErrorResponse(new Error('Invalid auth token'));
        }
    } catch (error) {
        return requestErrorResponse(error);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Successfully validated logged in state.',
        }),
    };
};
