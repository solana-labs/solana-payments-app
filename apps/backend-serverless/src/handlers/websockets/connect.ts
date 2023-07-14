import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import pkg from 'aws-sdk';
import { parseAndValidateConnectSchema } from '../../models/websockets/connect.model.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { WebsocketSessionService } from '../../services/database/websocket.database.service.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';
const { ApiGatewayManagementApi } = pkg;

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const connect = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyWebsocketEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in websocket connect',
            level: 'info',
            extra: {
                event,
            },
        });
        const websocketSessionService = new WebsocketSessionService(prisma);
        const paymentRecordService = new PaymentRecordService(prisma);

        try {
            const connectParameters = parseAndValidateConnectSchema((event as any).queryStringParameters);
            const connectionId = event.requestContext.connectionId;

            const paymentRecord = await paymentRecordService.getPaymentRecord({ id: connectParameters.paymentId });
            await websocketSessionService.createWebsocketSession(paymentRecord.id, connectionId);

            return {
                statusCode: 200,
            };
        } catch (error) {
            return createErrorResponse(error);
        }
    },
    {
        rethrowAfterCapture: false,
    }
);
