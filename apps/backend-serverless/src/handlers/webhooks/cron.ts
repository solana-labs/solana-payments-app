import { PrismaClient, TransactionRecord } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { processTransaction } from '../../services/business-logic/process-transaction.service.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import { WebSocketService } from '../../services/websocket/send-websocket-message.service.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';

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

        const signatures = allTransactionRecords.map(transactionRecord => transactionRecord.signature);

        const websocketService = new WebSocketService(
            websocketUrl,
            {
                signatures: signatures,
            },
            paymentRecordService
        );

        await websocketService.sendProcessingTransactionMessage();

        for (const transactionRecord of allTransactionRecords) {
            try {
                await processTransaction(transactionRecord.signature, prisma, websocketService, axios);
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
        rethrowAfterCapture: false,
    }
);
