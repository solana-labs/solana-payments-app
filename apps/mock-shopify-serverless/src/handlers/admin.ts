import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const admin = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            data: {
                shop: {
                    name: 'Mock Shopify Store',
                    email: 'harsha@solanapay.com',
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
