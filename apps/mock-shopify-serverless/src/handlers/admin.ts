import { APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from 'aws-lambda';
import crypto from 'crypto-js';

export const admin = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            data: {
                shop: {
                    name: 'Mock Shopify Store',
                    email: 'teej@solanapay.com',
                    enabledPresentmentCurrencies: ['USD'],
                },
            },
            extensions: {
                cost: {
                    requestedQueryCost: 1,
                    actualQueryCost: 1,
                    throttleStatus: {
                        maximumAvailable: 1000,
                        currentlyAvailable: 999,
                        restoreRate: 50,
                    },
                },
            },
        }),
    };
};
