import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import crypto from 'crypto-js';

export const stringifyParams = (params: { [key: string]: string }): string => {
    return Object.keys(params)
        .map(key => key + '=' + params[key])
        .join('&');
};

export const install = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const mockShopifySecret = 'MOCK_SHOPIFY_SECRET';

    console.log('In mock install handler');

    const installParams = {
        host: 'LETSGOPANTHERS',
        shop: 'localhost:4004',
        timestamp: 'timestamp',
    };

    const stringifiedParams = stringifyParams(installParams);
    const hmac = crypto.HmacSHA256(stringifiedParams, mockShopifySecret);

    const hmacString = hmac.toString();

    return {
        statusCode: 302,
        headers: {
            Location: `http://localhost:4000/install?hmac=${hmacString}&host=${installParams.host}&shop=${installParams.shop}&timestamp=${installParams.timestamp}`,
            'Content-Type': 'text/html',
        },
        body: JSON.stringify({}),
    };
};
