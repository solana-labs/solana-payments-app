import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import crypto from 'crypto';
import { parseAndValidateRejectPaymentResponse } from '../models/authorize.models.js';

export const stringifyParams = (params: { [key: string]: string }): string => {
    return Object.keys(params)
        .map(key => key + '=' + params[key])
        .join('&');
};

export const authorize = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const mockShopifySecret = 'secret';

    const installParams = {
        shop: 'localhost:4004',
        host: 'testhost',
        timestamp: 'timestamp',
    };

    const authorizeParameters = parseAndValidateRejectPaymentResponse(event.queryStringParameters);

    const authorizeParams = {
        code: 'code',
        host: 'testhost',
        shop: 'localhost:4004',
        state: authorizeParameters.state,
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
            Location: `http://localhost:4000/redirect?code=${authorizeParams.code}&hmac=${hmacString}&host=${authorizeParams.host}&shop=${authorizeParams.shop}&state=${authorizeParams.state}&timestamp=${authorizeParams.timestamp}`,
            'Content-Type': 'text/html',
        },
        body: JSON.stringify({}),
    };
};
