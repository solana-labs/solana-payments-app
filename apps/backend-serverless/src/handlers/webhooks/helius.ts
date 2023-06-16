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
            const error = new MissingEnvError('websocket url');
            Sentry.captureException(error);
            return createErrorResponse(new MissingEnvError('websocket url'));
        }

        const websocketService = new WebSocketService(
            websocketUrl,
            {
                signatures: heliusEnhancedTransactions.map(transaction => transaction.signature),
            },
            paymentRecordService
        );

        await websocketService.sendProcessingTransactionMessage();

        for (const heliusTransaction of heliusEnhancedTransactions) {
            // const websocketService = new WebSocketService(
            //     websocketUrl,
            //     {
            //         signature: heliusTransaction.signature,
            //     },
            //     paymentRecordService
            // );

            // I don't think I actually want to process all of the transactions here, i should move this to a queue for final processing.
            // But do i want to get the transaction record first? We would only want to process the transactions if there is a transcation record for it.
            // I could try to do a single prisma query to get all of the transaction records and the websocket sessions. It would probably be the most performant.
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
