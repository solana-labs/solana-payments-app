import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { withAuth } from '../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { requestErrorResponse } from '../../utilities/responses/request-response.utility.js';

export const verifyLogin = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    Sentry.captureEvent({
        message: 'in verify login testing',
        level: 'info',
    });
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
