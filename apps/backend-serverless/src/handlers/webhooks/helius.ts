import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
    HeliusEnhancedTransactionArray,
    parseAndValidateHeliusEnchancedTransaction,
} from '../../models/dependencies/helius-enhanced-transaction.model.js';

import { PrismaClient, TransactionType, WebsocketSession } from '@prisma/client';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import {
    ErrorMessage,
    ErrorType,
    createErrorResponse,
    errorResponse,
} from '../../utilities/responses/error-response.utility.js';
import {
    PaymentRecordService,
    TransactionSignatureQuery,
} from '../../services/database/payment-record-service.database.service.js';
import { WebSocketService } from '../../services/websocket/send-websocket-message.service.js';
import { HeliusHeader, parseAndValidateHeliusHeader } from '../../models/dependencies/helius-header.model.js';
import { processTransaction } from '../../services/business-logic/process-transaction.service.js';
import axios from 'axios';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { UnauthorizedRequestError } from '../../errors/unauthorized-request.error.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';

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

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('missing body'));
        }

        const requiredAuthorizationHeader = process.env.HELIUS_AUTHORIZATION;

        if (requiredAuthorizationHeader == null) {
            return createErrorResponse(new UnauthorizedRequestError('missing authorization header'));
        }

        try {
            heliusHeaders = parseAndValidateHeliusHeader({ authorization: event.headers['authorization'] });
        } catch (error) {
            Sentry.captureException(error);
            return createErrorResponse(error);
        }

        if (heliusHeaders.authorization !== requiredAuthorizationHeader) {
            return createErrorResponse(new UnauthorizedRequestError('invalid authorization header'));
        }

        try {
            heliusEnhancedTransactions = parseAndValidateHeliusEnchancedTransaction(JSON.parse(event.body));
        } catch (error) {
            // I dont think this is critical, but it kinda is because helius should be giving us expected data
            Sentry.captureException(error);
            return createErrorResponse(error);
        }

        const websocketUrl = process.env.WEBSOCKET_URL;

        if (websocketUrl == null) {
            return createErrorResponse(new MissingEnvError('websocket url'));
        }

        for (const heliusTransaction of heliusEnhancedTransactions) {
            const websocketService = new WebSocketService(
                websocketUrl,
                {
                    signature: heliusTransaction.signature,
                },
                paymentRecordService
            );

            await websocketService.sendProcessingTransactionMessage();

            try {
                await processTransaction(heliusTransaction, prisma, websocketService, axios);
            } catch (error) {
                await websocketService.sendFailedProcessingTransactionMessage();
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
