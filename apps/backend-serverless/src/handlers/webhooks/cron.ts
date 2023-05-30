import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { fetchEnhancedTransaction } from '../../services/helius.service.js';
import { PrismaClient, TransactionType } from '@prisma/client';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import { processDiscoveredPaymentTransaction } from '../../services/buisness-logic/process-discovered-payment-transaction.service.js';
import { processDiscoveredRefundTransaction } from '../../services/buisness-logic/process-discovered-refund-transaction.service.js';
import { HeliusEnhancedTransaction } from '../../models/dependencies/helius-enhanced-transaction.model.js';
import { web3 } from '@project-serum/anchor';
import { fetchTransaction } from '../../services/fetch-transaction.service.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

// I want to clarify this isn't for retrying messages to shopify. This is equivilant to the helius webhook. We will be doing shopify
// things in another chron job.
export const cron = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const prisma = new PrismaClient();
        const transactionRecordService = new TransactionRecordService(prisma);

        const paymentTransactionRecords = await transactionRecordService.getTransactionRecordsForPendingPayments();
        const refundTransactionRecords = await transactionRecordService.getTransactionRecordsForPendingRefunds();
        const allTransactionRecords = [...paymentTransactionRecords, ...refundTransactionRecords];

        for (const transactionRecord of allTransactionRecords) {
            let transaction: web3.Transaction | null;

            try {
                transaction = await fetchTransaction(transactionRecord.signature);
            } catch (error) {
                // this will fail if our fetch transaction fails, it shouldnt throw if the tx isn't on chain though
                // if the tx isn't on chain, it should return null and we will continue in the next logic block
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
