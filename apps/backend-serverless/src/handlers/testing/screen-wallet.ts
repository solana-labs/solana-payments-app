import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TrmService } from '../../services/trm-service.service.js';
import { requestErrorResponse } from '../../utilities/responses/request-response.utility.js';

export const screenWallet = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    Sentry.captureEvent({
        message: 'in screen wallet testing',
        level: 'info',
    });
    const address = 'Htp9MGP8Tig923ZFY7Qf2zzbMUmYneFRAhSp7vSg4wxV';

    const TRM_API_KEY = process.env.TRM_API_KEY;

    if (TRM_API_KEY == null) {
        return requestErrorResponse(new Error('Failed to update merchant.'));
    }

    const trmService = new TrmService(TRM_API_KEY);

    try {
        await trmService.screenAddress(address);
    } catch (error: any) {
        return requestErrorResponse(error);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({}),
    };
};
