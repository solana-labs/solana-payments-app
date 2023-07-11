import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    HeliusEnhancedTransactionArray,
    parseAndValidateHeliusEnchancedTransaction,
} from '../../models/dependencies/helius-enhanced-transaction.model.js';

import { PrismaClient, TransactionRecord } from '@prisma/client';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { UnauthorizedRequestError } from '../../errors/unauthorized-request.error.js';
import { HeliusHeader, parseAndValidateHeliusHeader } from '../../models/dependencies/helius-header.model.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import { sendProcessTransactionMessage } from '../../services/sqs/sqs-send-message.service.js';
import { WebSocketService } from '../../services/websocket/send-websocket-message.service.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';

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
        let heliusEnhancedTransactions: HeliusEnhancedTransactionArray;
        let heliusHeaders: HeliusHeader;
        const paymentRecordService = new PaymentRecordService(prisma);
        const transactionRecordService = new TransactionRecordService(prisma);

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
            // need to flag this as very bad
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

        const signatures = heliusEnhancedTransactions.map(transaction => transaction.signature);

        console.log(signatures);

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
            // Think message isn't gonna find anyone, if it did, we would have transaction records since the websocket service
            // has a dependency on the transaction record service. Here for safety
            await websocketService.sendFailedProcessingTransactionMessage();
            return {
                statusCode: 200,
                body: JSON.stringify({}),
            };
        }

        const failedTransactionRecordMessages: { error: unknown; transactionRecord: TransactionRecord }[] = [];

        for (const transactionRecord of transactionRecords) {
            // send a message to the queue, even better if we can send an array of messages to the queue
            try {
                console.log('sending message to queue');
                await sendProcessTransactionMessage(transactionRecord.signature);
            } catch (error) {
                failedTransactionRecordMessages.push({ error: error, transactionRecord: transactionRecord });
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
            // I mean literally what else could go wrong?
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
