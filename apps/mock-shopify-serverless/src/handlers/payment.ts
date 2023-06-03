import { APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from 'aws-lambda';
import crypto from 'crypto-js';
import axios from 'axios';

function getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export const payment = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const id = getRandomArbitrary(1, 1000000).toString();
    const gid = getRandomArbitrary(1, 1000000).toString();
    const group = getRandomArbitrary(1, 1000000).toString();

    try {
        const response = await axios({
            url: 'http://localhost:4006/payment',
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'shopify-shop-domain': 'localhost:4004',
            },
            data: JSON.stringify({
                id: id,
                gid: gid,
                group: group,
                amount: 5.1,
                currency: 'USD',
                test: true,
                merchant_locale: 'en',
                payment_method: {
                    type: 'type',
                    data: {
                        cancel_url: 'https://www.apple.com',
                    },
                },
                proposed_at: '2021-08-10T18:02:00.000Z',
                kind: 'payment',
                customer: null,
            }),
        });

        const redirect_url = response.data.redirect_url;

        return {
            statusCode: 302,
            headers: {
                Location: redirect_url,
                'Content-Type': 'text/html',
            },
            body: JSON.stringify({}),
        };
    } catch (error) {
        return {
            statusCode: 200,
            body: JSON.stringify(error),
        };
    }
};
