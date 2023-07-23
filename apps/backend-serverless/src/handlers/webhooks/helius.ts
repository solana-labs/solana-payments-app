import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { parseAndValidateHeliusEnchancedTransaction } from '../../models/dependencies/helius-enhanced-transaction.model';

import { PrismaClient, TransactionRecord } from '@prisma/client';
import { InvalidInputError } from '../../errors/invalid-input.error';
import { UnauthorizedRequestError } from '../../errors/unauthorized-request.error';
import { parseAndValidateHeliusHeader } from '../../models/dependencies/helius-header.model';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service';
import { sendProcessTransactionMessage } from '../../services/sqs/sqs-send-message.service';
import { WebSocketService } from '../../services/websocket/send-websocket-message.service';
import { createErrorResponse } from '../../utilities/responses/error-response.utility';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const helius = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in helius',
            level: 'info',
        });

        const requiredAuthorizationHeader = process.env.HELIUS_AUTHORIZATION;
        const websocketUrl = process.env.WEBSOCKET_URL;

        const paymentRecordService = new PaymentRecordService(prisma);
        const transactionRecordService = new TransactionRecordService(prisma);

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('missing body'));
        }

        if (requiredAuthorizationHeader == null) {
            return createErrorResponse(new UnauthorizedRequestError('missing authorization header'));
        }

        if (websocketUrl == null) {
            return createErrorResponse(new UnauthorizedRequestError('missing websocket url'));
        }

        try {
            const heliusHeaders = parseAndValidateHeliusHeader({ authorization: event.headers['authorization'] });

            if (heliusHeaders.authorization !== requiredAuthorizationHeader) {
                return createErrorResponse(new UnauthorizedRequestError('invalid authorization header'));
            }

            const heliusEnhancedTransactions = parseAndValidateHeliusEnchancedTransaction(JSON.parse(event.body));
            const signatures = heliusEnhancedTransactions.map(transaction => transaction.signature);

            const websocketService = new WebSocketService(
                websocketUrl,
                {
                    signatures: signatures,
                },
                paymentRecordService
            );

            try {
                await websocketService.sendProcessingTransactionMessage();
            } catch (error) {
                Sentry.captureException(error);
            }

            const transactionRecords = await transactionRecordService.getTransactionRecords(signatures);

            if (transactionRecords == null) {
                // Think message isn't gonna find anyone, if it did, we would have transaction records since the websocket service
                // has a dependency on the transaction record service. Here for safety
                await websocketService.sendFailedProcessingTransactionMessage();
                return {
                    statusCode: 200,
                    body: JSON.stringify({}),
                };
            }

            const failedTransactionRecordMessages: {
                error: unknown;
                transactionRecord: TransactionRecord;
            }[] = [];

            for (const transactionRecord of transactionRecords) {
                // send a message to the queue, even better if we can send an array of messages to the queue
                try {
                    await sendProcessTransactionMessage(transactionRecord.signature);
                } catch (error) {
                    failedTransactionRecordMessages.push({
                        error: error,
                        transactionRecord: transactionRecord,
                    });
                    Sentry.captureException(error);
                    continue;
                }
            }
            const failedTransactionRecordSignatures = failedTransactionRecordMessages.map(record => {
                return record.transactionRecord.signature;
            });

            const failedWebsocketService = new WebSocketService(
                websocketUrl,
                {
                    signatures: failedTransactionRecordSignatures,
                },
                paymentRecordService
            );

            try {
                await failedWebsocketService.sendFailedProcessingTransactionMessage();
            } catch (error) {
                Sentry.captureException(error);
            }
        } catch (error) {
            return createErrorResponse(error);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({}, null, 2),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
