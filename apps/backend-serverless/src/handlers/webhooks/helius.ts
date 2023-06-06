import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
    HeliusEnhancedTransactionArray,
    parseAndValidateHeliusEnchancedTransaction,
} from '../../models/dependencies/helius-enhanced-transaction.model.js';
import { PrismaClient, TransactionType } from '@prisma/client';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import { processDiscoveredPaymentTransaction } from '../../services/buisness-logic/process-discovered-payment-transaction.service.js';
import { processDiscoveredRefundTransaction } from '../../services/buisness-logic/process-discovered-refund-transaction.service.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const helius = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        let heliusEnhancedTransactions: HeliusEnhancedTransactionArray;
        const transactionRecordService = new TransactionRecordService(prisma);

        console.log('in helius');

        if (event.body == null) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.missingBody);
        }

        const requiredAuthorizationHeader = process.env.HELIUS_AUTHORIZATION;

        if (requiredAuthorizationHeader != null) {
            const authorizationHeader = event.headers['authorization'];

            if (authorizationHeader !== requiredAuthorizationHeader) {
                return errorResponse(ErrorType.unauthorized, ErrorMessage.missingHeader);
            }
        }

        try {
            heliusEnhancedTransactions = parseAndValidateHeliusEnchancedTransaction(JSON.parse(event.body));
        } catch (error) {
            // Returning an error will get Helius to retry but it might not fix it. We should log as a critical error
            // TODO: Log this, actually might not be critical but we might want to put more logic around seeing if it's critical
            // In theory, this is an open endpoint, we might actually be able to lock it down somehow, might be a good idea so we can flag

            Sentry.captureException(error);
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestBody);
        }

        console.log('parsed helius');

        for (const heliusTransaction of heliusEnhancedTransactions) {
            try {
                const transactionRecord = await transactionRecordService.getTransactionRecord({
                    signature: heliusTransaction.signature,
                });

                if (transactionRecord == null) {
                    // TODO: Log this with Sentry, not critical at all, total pheasble this could happen, still can throw and it will be caught and logged
                    Sentry.captureException(new Error('Transaction record not found'));
                    throw new Error('Transaction record not found');
                }

                console.log('got transaction record');

                switch (transactionRecord.type) {
                    case TransactionType.payment:
                        console.log('its a payment');
                        await processDiscoveredPaymentTransaction(transactionRecord, heliusTransaction, prisma);
                        break;
                    case TransactionType.refund:
                        await processDiscoveredRefundTransaction(transactionRecord, heliusTransaction, prisma);
                        break;
                }
            } catch (error) {
                // We will catch here on odd throws, valuable catches should happen elsewhere
                // TODO: Add logging around these odd throws with Sentry
                Sentry.captureException(error);
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
    },
    {
        rethrowAfterCapture: false,
    }
);
