import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { fetchEnhancedTransaction } from '../../services/helius.service.js';
import { PrismaClient, TransactionRecord, TransactionType } from '@prisma/client';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import { processDiscoveredPaymentTransaction } from '../../services/buisness-logic/process-discovered-payment-transaction.service.js';
import { processDiscoveredRefundTransaction } from '../../services/buisness-logic/process-discovered-refund-transaction.service.js';
import { HeliusEnhancedTransaction } from '../../models/dependencies/helius-enhanced-transaction.model.js';
import { web3 } from '@project-serum/anchor';
import { fetchTransaction } from '../../services/fetch-transaction.service.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const cron = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const transactionRecordService = new TransactionRecordService(prisma);

        let paymentTransactionRecords: TransactionRecord[];

        try {
            paymentTransactionRecords = await transactionRecordService.getTransactionRecordsForPendingPayments();
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.databaseAccessError);
        }

        let refundTransactionRecords: TransactionRecord[];

        try {
            refundTransactionRecords = await transactionRecordService.getTransactionRecordsForPendingRefunds();
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.databaseAccessError);
        }

        const allTransactionRecords = [...paymentTransactionRecords, ...refundTransactionRecords];

        for (const transactionRecord of allTransactionRecords) {
            let transaction: HeliusEnhancedTransaction | null;

            try {
                transaction = await fetchEnhancedTransaction(transactionRecord.signature);
            } catch (error) {
                Sentry.captureException(error);
                continue;
            }

            if (transaction == null) {
                continue;
            }

            try {
                switch (transactionRecord.type) {
                    case TransactionType.payment:
                        await processDiscoveredPaymentTransaction(transactionRecord, transaction, prisma);
                        break;
                    case TransactionType.refund:
                        await processDiscoveredRefundTransaction(transactionRecord, transaction, prisma);
                        break;
                }
            } catch (error) {
                // If we're catching here, it means we failed to get to the end of a processDiscoveredTransaction function
                // This should only happen in odd situations that require investigation
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
