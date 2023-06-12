import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import pkg from 'aws-sdk';
import { WebsocketSessionService } from '../../services/database/websocket.database.service.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
const { ApiGatewayManagementApi } = pkg;

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const connect = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyWebsocketEventV2): Promise<APIGatewayProxyResultV2> => {
        const websocketSessionService = new WebsocketSessionService(prisma);
        const paymentRecordService = new PaymentRecordService(prisma);

        console.log(event);

        const paymentId = (event as any).queryStringParameters.paymentId;
        const connectionId = event.requestContext.connectionId;

        const paymentRecord = await paymentRecordService.getPaymentRecord({ id: paymentId });

        if (paymentRecord == null) {
            // need a payment record or we dont care about you
            throw new Error('Payment record not found');
        }

        await websocketSessionService.createWebsocketSession(paymentRecord.id, connectionId);

        return {
            statusCode: 200,
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
