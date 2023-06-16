import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { fetchEnhancedTransaction } from '../../services/helius.service.js';
import { PrismaClient, TransactionRecord, TransactionType } from '@prisma/client';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import { HeliusEnhancedTransaction } from '../../models/dependencies/helius-enhanced-transaction.model.js';
import {
    ErrorMessage,
    ErrorType,
    createErrorResponse,
    errorResponse,
} from '../../utilities/responses/error-response.utility.js';
import { processTransaction } from '../../services/business-logic/process-transaction.service.js';
import axios from 'axios';
import { WebSocketService } from '../../services/websocket/send-websocket-message.service.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { create } from 'lodash';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const cron = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const transactionRecordService = new TransactionRecordService(prisma);
        const paymentRecordService = new PaymentRecordService(prisma);

        const websocketUrl = process.env.WEBSOCKET_URL;

        if (websocketUrl == null) {
            throw new Error('Missing websocket url');
        }

        let paymentTransactionRecords: TransactionRecord[];

        try {
            paymentTransactionRecords = await transactionRecordService.getTransactionRecordsForPendingPayments();
        } catch (error) {
            return createErrorResponse(error);
        }

        let refundTransactionRecords: TransactionRecord[];

        try {
            refundTransactionRecords = await transactionRecordService.getTransactionRecordsForPendingRefunds();
        } catch (error) {
            return createErrorResponse(error);
        }

        const allTransactionRecords = [...paymentTransactionRecords, ...refundTransactionRecords];

        for (const transactionRecord of allTransactionRecords) {
            let transaction: HeliusEnhancedTransaction | null;

            // Todo: use the api that gets you a bunch of transactions, up to 100
            try {
                transaction = await fetchEnhancedTransaction(transactionRecord.signature);
            } catch (error) {
                Sentry.captureException(error);
                continue;
            }

            if (transaction == null) {
                continue;
            }

            const websocketService = new WebSocketService(
                websocketUrl,
                {
                    signature: transaction.signature,
                },
                paymentRecordService
            );

            await websocketService.sendProcessingTransactionMessage();

            try {
                await processTransaction(transaction, prisma, websocketService, axios);
            } catch (error) {
                Sentry.captureException(error);
                continue;
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
