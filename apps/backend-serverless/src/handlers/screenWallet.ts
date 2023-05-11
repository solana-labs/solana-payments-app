import { APIGatewayProxyHandler } from 'aws-lambda';
import { screenAddress, validateTrmResponse } from '../services/trm.service.js';

export const screenWallet: APIGatewayProxyHandler = async event => {
    const address = 'Htp9MGP8Tig923ZFY7Qf2zzbMUmYneFRAhSp7vSg4wxV';

    if (!address) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Address parameter is missing' }),
        };
    }

    try {
        const response = await screenAddress(address);

        const riskLevelBelow5 = response.every((item: any) =>
            item.entities.every((entity: any) => entity.riskScoreLevel < 5)
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ riskLevelBelow5 }),
        };
    } catch (error: any) {
        return {
            statusCode: error.response.status,
            body: JSON.stringify(error.response.data),
        };
    }
};
