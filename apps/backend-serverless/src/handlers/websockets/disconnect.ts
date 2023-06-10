import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const disconnect = Sentry.AWSLambda.wrapHandler(
    async (event: unknown): Promise<APIGatewayProxyResultV2> => {
        console.log('GOODBYE WEBSOCKET');
        console.log('GOODBYE WEBSOCKET');
        console.log('GOODBYE WEBSOCKET');
        console.log('GOODBYE WEBSOCKET');
        console.log('GOODBYE WEBSOCKET');
        console.log('GOODBYE WEBSOCKET');
        console.log('GOODBYE WEBSOCKET');
        console.log('GOODBYE WEBSOCKET');
        console.log('GOODBYE WEBSOCKET');
        console.log('GOODBYE WEBSOCKET');
        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
