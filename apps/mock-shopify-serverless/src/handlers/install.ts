import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import crypto from 'crypto';

export const stringifyParams = (params: { [key: string]: string }): string => {
    return Object.keys(params)
        .map(key => key + '=' + params[key])
        .join('&');
};

export const install = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const mockShopifySecret = 'MOCK_SHOPIFY_KEY';

    console.log('In mock install handler');

    const installParams = {
        host: 'testhost',
        shop: 'localhost:4004',
        timestamp: 'timestamp',
    };

    const hmac = crypto
        .createHmac('sha256', mockShopifySecret)
        .update(Buffer.from(stringifyParams(installParams)))
        .digest('hex');
    const hmacString = hmac.toString();

    return {
        statusCode: 302,
        headers: {
            Location: `https://localhost:4000/install?hmac=${hmacString}&host=${installParams.host}&shop=${installParams.shop}&timestamp=${installParams.timestamp}`,
            'Content-Type': 'text/html',
        },
        body: JSON.stringify({}),
    };
};
