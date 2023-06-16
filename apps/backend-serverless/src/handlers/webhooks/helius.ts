import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
    HeliusEnhancedTransactionArray,
    parseAndValidateHeliusEnchancedTransaction,
} from '../../models/dependencies/helius-enhanced-transaction.model.js';

import { PrismaClient } from '@prisma/client';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
<<<<<<< HEAD
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { WebSocketService } from '../../services/websocket/send-websocket-message.service.js';
import { HeliusHeader, parseAndValidateHeliusHeader } from '../../models/dependencies/helius-header.model.js';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { UnauthorizedRequestError } from '../../errors/unauthorized-request.error.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { sendProcessTransactionMessage } from '../../services/sqs/sqs-send-message.service.js';
=======
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
>>>>>>> 5522baa (added favicon and domain correctly goes to pay.solanapay.com (#306))

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

// TODO: If we only get one transaction, we should just process it right away. We should only send it to the queue if we get multiple transactions.
export const helius = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        let heliusEnhancedTransactions: HeliusEnhancedTransactionArray;
        let heliusHeaders: HeliusHeader;
        const paymentRecordService = new PaymentRecordService(prisma);
<<<<<<< HEAD
        const transactionRecordService = new TransactionRecordService(prisma);
=======
>>>>>>> 5522baa (added favicon and domain correctly goes to pay.solanapay.com (#306))

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
<<<<<<< HEAD
            const error = new MissingEnvError('websocket url');
            Sentry.captureException(error);
=======
>>>>>>> 5522baa (added favicon and domain correctly goes to pay.solanapay.com (#306))
            return createErrorResponse(new MissingEnvError('websocket url'));
        }

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
            // If it fails, its not the end of the world
        }

        const transactionRecords = await transactionRecordService.getTransactionRecords(signatures);

        if (transactionRecords == null) {
            await websocketService.sendFailedProcessingTransactionMessage();
            return {
                statusCode: 200,
                body: JSON.stringify({}),
            };
        }

        for (const transactionRecord of transactionRecords) {
            // send a message to the queue, even better if we can send an array of messages to the queue
            try {
                console.log('sending message to queue');
                await sendProcessTransactionMessage(transactionRecord.signature);
            } catch (error) {
<<<<<<< HEAD
                // TODO: Only send the failed message to the failed websocket sessions
=======
>>>>>>> 5522baa (added favicon and domain correctly goes to pay.solanapay.com (#306))
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
