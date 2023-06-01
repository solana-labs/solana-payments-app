import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
    HeliusEnhancedTransactionArray,
    parseAndValidateHeliusEnchancedTransaction,
} from '../../models/dependencies/helius-enhanced-transaction.model.js';
import { requestErrorResponse } from '../../utilities/responses/request-response.utility.js';
import { PrismaClient, TransactionType } from '@prisma/client';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import { processDiscoveredPaymentTransaction } from '../../services/buisness-logic/process-discovered-payment-transaction.service.js';
import { processDiscoveredRefundTransaction } from '../../services/buisness-logic/process-discovered-refund-transaction.service.js';
import { web3 } from '@project-serum/anchor';
import { fetchTransaction } from '../../services/fetch-transaction.service.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

export const helius = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        let heliusEnhancedTransactions: HeliusEnhancedTransactionArray;
        const prisma = new PrismaClient();
        const transactionRecordService = new TransactionRecordService(prisma);

        try {
            heliusEnhancedTransactions = parseAndValidateHeliusEnchancedTransaction(event.body);
        } catch (error) {
            // Returning an error will get Helius to retry but it might not fix it. We should log as a critical error
            // TODO: Log this, actually might not be critical but we might want to put more logic around seeing if it's critical
            // In theory, this is an open endpoint, we might actually be able to lock it down somehow, might be a good idea so we can flag
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestBody);
        }

        for (const heliusTransaction of heliusEnhancedTransactions) {
            try {
                const transactionRecord = await transactionRecordService.getTransactionRecord({
                    signature: heliusTransaction.signature,
                });

                if (transactionRecord == null) {
                    // TODO: Log this with Sentry, not critical at all, total pheasble this could happen, still can throw and it will be caught and logged
                    throw new Error('Transaction record not found');
                }

                const transaction = await fetchTransaction(transactionRecord.signature);

                switch (transactionRecord.type) {
                    case TransactionType.payment:
                        await processDiscoveredPaymentTransaction(transactionRecord, transaction, prisma);
                        break;
                    case TransactionType.refund:
                        await processDiscoveredRefundTransaction(transactionRecord, transaction, prisma);
                        break;
                }
            } catch (error) {
                // We will catch here on odd throws, valuable catches should happen elsewhere
                // TODO: Add logging around these odd throws with Sentry
                continue;
            }
        }

        // This call is from Helius, for now our return value doesn't matter but
        // I wonder if we return bad status codes if that could get them to retry themselves later??
        // How do I tag mert from github
        return {
            statusCode: 200,
            body: JSON.stringify({}, null, 2),
        };
    }
);
