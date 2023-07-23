import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, SQSEvent } from 'aws-lambda';
import { USDC_MINT } from '../../../configs/tokens.config';
import { MissingEnvError } from '../../../errors/missing-env.error';
import {
    SolanaPayInfoMessage,
    parseAndValidateSolanaPayInfoMessage,
} from '../../../models/sqs/solana-pay-info-message.model';
import { PaymentRecordService } from '../../../services/database/payment-record-service.database.service';
import { WebsocketSessionService } from '../../../services/database/websocket.database.service';
import { fetchBalance } from '../../../services/helius.service';
import { WebSocketService } from '../../../services/websocket/send-websocket-message.service';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility';

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
        if (websocketUrl == null) {
            return createErrorResponse(new MissingEnvError('websocket url'));
        }

        const paymentRecordService = new PaymentRecordService(prisma);
        const websocketSessionService = new WebsocketSessionService(prisma);

        for (const record of event.Records) {
            const solanaPayInfoMessageBody = JSON.parse(record.body);

            let solanaPayInfoMessage: SolanaPayInfoMessage;

            try {
                solanaPayInfoMessage = parseAndValidateSolanaPayInfoMessage(solanaPayInfoMessageBody);
            } catch (error) {
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

            let paymentRecord;

            try {
                paymentRecord = await paymentRecordService.getPaymentRecord({
                    id: solanaPayInfoMessage.paymentRecordId,
                });
                // we dont actually have a payment record but we dont want to retry by throwing error
            } catch {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: 'Successfully process transaction.',
                    }),
                };
            }

            try {
                const usdcSize = await fetchBalance(solanaPayInfoMessage.account, USDC_MINT.toBase58());
                if (paymentRecord.usdcAmount > usdcSize) {
                    await websocketService.sendInsufficientFundsMessage();
                }
            } catch (error) {
                return createErrorResponse(error);
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
