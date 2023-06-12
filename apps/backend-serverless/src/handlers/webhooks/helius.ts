import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
    HeliusEnhancedTransactionArray,
    parseAndValidateHeliusEnchancedTransaction,
} from '../../models/dependencies/helius-enhanced-transaction.model.js';
import { PrismaClient, WebsocketSession } from '@prisma/client';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { sendWebsocketMessage } from '../../services/websocket/send-websocket-message.service.js';
import { HeliusHeader, parseAndValidateHeliusHeader } from '../../models/dependencies/helius-header.model.js';
import { processTransaction } from '../../services/business-logic/process-transaction.service.js';
import axios from 'axios';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const helius = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        let heliusEnhancedTransactions: HeliusEnhancedTransactionArray;
        let heliusHeaders: HeliusHeader;
        const paymentRecordService = new PaymentRecordService(prisma);

        console.log('in helius');

        if (event.body == null) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.missingBody);
        }

        const requiredAuthorizationHeader = process.env.HELIUS_AUTHORIZATION;

        if (requiredAuthorizationHeader == null) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.missingEnv);
        }

        try {
            heliusHeaders = parseAndValidateHeliusHeader(event.headers);
        } catch (error) {
            Sentry.captureException(error);
            return errorResponse(ErrorType.badRequest, ErrorMessage.missingHeader);
        }

        if (heliusHeaders.authorization !== requiredAuthorizationHeader) {
            return errorResponse(ErrorType.unauthorized, ErrorMessage.missingHeader);
        }

        try {
            heliusEnhancedTransactions = parseAndValidateHeliusEnchancedTransaction(JSON.parse(event.body));
        } catch (error) {
            // TODO: Log this, actually might not be critical but we might want to put more logic around seeing if it's critical
            Sentry.captureException(error);
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestBody);
        }

        console.log('parsed helius');

        for (const heliusTransaction of heliusEnhancedTransactions) {
            let websocketSessions: WebsocketSession[] | null = null;

            const paymentRecordAndWebsocketService =
                await paymentRecordService.getPaymentRecordAndWebsocketServiceForTransactionSignature(
                    heliusTransaction.signature
                );

            websocketSessions = paymentRecordAndWebsocketService.websocketSessions;

            for (const websocketSession of websocketSessions) {
                try {
                    await sendWebsocketMessage(websocketSession.connectionId, {
                        messageType: 'processingTransaction',
                    });
                } catch (error) {
                    // prob just closed and orphaned
                    continue;
                }
            }

            try {
                await processTransaction(heliusTransaction, prisma, websocketSessions, axios);
            } catch (error) {
                // We will catch here on odd throws, valuable catches should happen elsewhere
                // TODO: Add logging around these odd throws with Sentry

                for (const websocketSession of websocketSessions) {
                    try {
                        await sendWebsocketMessage(websocketSession.connectionId, {
                            messageType: 'failedProcessingTransaction',
                        });
                    } catch (error) {
                        // prob just closed and orphaned
                        continue;
                    }
                }

                Sentry.captureException(error);
                continue;
            }
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
