import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import { TrmService } from '../../services/trm-service.service.js';

export const screenWallet = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
