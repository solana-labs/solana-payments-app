import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import pkg from 'aws-sdk';
const { ApiGatewayManagementApi } = pkg;

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const connect = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyWebsocketEventV2): Promise<APIGatewayProxyResultV2> => {
        const apigwManagementApi = new ApiGatewayManagementApi({
            endpoint: 'http://localhost:4009',
        });
        console.log('CONNECTED');
        console.log('CONNECTED');
        console.log('CONNECTED');
        console.log('CONNECTED');
        console.log('CONNECTED');
        console.log('CONNECTED');
        console.log('CONNECTED');
        console.log('CONNECTED');
        console.log('CONNECTED');
        console.log('CONNECTED');
        console.log(event);

        const postParams = {
            Data: JSON.stringify({
                messageType: 'paymentDetails',
                paymentDetails: {
                    merchantDisplayName: 'Test Merchant',
                    totalAmountUSDCDisplay: '10 USDC',
                    totalAmountFiatDisplay: '$10.00',
                    cancelUrl: 'https://example.com/cancel',
                    completed: false,
                    redirectUrl: null,
                },
            }),
            ConnectionId: event.requestContext.connectionId,
        };

        // try {
        //     const connection = await apigwManagementApi.postToConnection(postParams).promise();
        //     console.log(connection);
        // } catch (err) {
        //     if (err.statusCode === 410) {
        //         console.log(err);
        //         console.log('Found stale connection, deleting ' + event.requestContext.connectionId);
        //     } else {
        //         console.error('Failed to post. Error: ' + JSON.stringify(err));
        //     }
        // }

        return {
            statusCode: 200,
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
