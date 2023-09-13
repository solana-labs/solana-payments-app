import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import { WebsocketSessionService } from '../../services/database/websocket.database.service.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const disconnect = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyWebsocketEventV2): Promise<APIGatewayProxyResultV2> => {
        const websocketSessionService = new WebsocketSessionService(prisma);

        await websocketSessionService.deleteWebsocketSession({
            connectionId: event.requestContext.connectionId,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
