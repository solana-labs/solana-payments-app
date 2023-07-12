import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, SQSEvent } from 'aws-lambda';
import { MissingEnvError } from '../../../errors/missing-env.error.js';
import {
    SolanaPayInfoMessage,
    parseAndValidateSolanaPayInfoMessage,
} from '../../../models/sqs/solana-pay-info-message.model.js';
import { PaymentRecordService } from '../../../services/database/payment-record-service.database.service.js';
import { WebsocketSessionService } from '../../../services/database/websocket.database.service.js';
import { fetchUsdcSize } from '../../../services/helius.service.js';
import { WebSocketService } from '../../../services/websocket/send-websocket-message.service.js';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const solanaPayInfoMessage = Sentry.AWSLambda.wrapHandler(
    async (event: SQSEvent): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in solana-pay-info-message',
            level: 'info',
        });
        const websocketUrl = process.env.WEBSOCKET_URL;

        const paymentRecordService = new PaymentRecordService(prisma);
        const websocketSessionService = new WebsocketSessionService(prisma);

        if (websocketUrl == null) {
            const error = new MissingEnvError('websocket url');
            Sentry.captureException(error);
            return createErrorResponse(new MissingEnvError('websocket url'));
        }

        for (const record of event.Records) {
            const solanaPayInfoMessageBody = JSON.parse(record.body);

            let solanaPayInfoMessage: SolanaPayInfoMessage;

            try {
                solanaPayInfoMessage = parseAndValidateSolanaPayInfoMessage(solanaPayInfoMessageBody);
            } catch (error) {
                console.log(error);
                Sentry.captureException(error);
                // How can we make this single one retry? We can set the batch to 0 so this doesnt happen for now.
                continue;
            }

            const websocketService = new WebSocketService(
                websocketUrl,
                {
                    paymentRecordId: solanaPayInfoMessage.paymentRecordId,
                },
                websocketSessionService
            );

            const paymentRecord = await paymentRecordService.getPaymentRecord({
                id: solanaPayInfoMessage.paymentRecordId,
            });

            if (paymentRecord == null) {
                // we dont actually have a payment record but we dont wana throw an error or else this will retry
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: 'Successfully process transaction.',
                    }),
                };
            }

            let usdcSize: number;

            try {
                usdcSize = await fetchUsdcSize(solanaPayInfoMessage.account);
            } catch (error) {
                // we dont have the alpha
                return createErrorResponse(error);
            }

            if (paymentRecord.usdcAmount > usdcSize) {
                // this is alpha, we want to tell them that they dont got it like that
                await websocketService.sendInsufficientFundsMessage();
            }
        }

        return successfulMessage();
    },
    {
        rethrowAfterCapture: false,
    }
);

const successfulMessage = (): APIGatewayProxyResultV2 => {
    return {
        statusCode: 200,
        body: JSON.stringify({}),
    };
};
