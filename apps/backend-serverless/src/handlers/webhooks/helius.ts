import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
    HeliusEnhancedTransactionArray,
    parseAndValidateHeliusEnchancedTransaction,
} from '../../models/dependencies/helius-enhanced-transaction.model.js';
import { PaymentRecord, PrismaClient, RefundRecord, TransactionType, WebsocketSession } from '@prisma/client';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import { processDiscoveredPaymentTransaction } from '../../services/business-logic/process-discovered-payment-transaction.service.js';
import { processDiscoveredRefundTransaction } from '../../services/business-logic/process-discovered-refund-transaction.service.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { WebsocketSessionService } from '../../services/database/websocket.database.service.js';
import { sendWebsocketMessage } from '../../services/websocket/send-websocket-message.service.js';
import { RefundRecordService } from '../../services/database/refund-record-service.database.service.js';

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
        const paymentRecordService = new PaymentRecordService(prisma);
        const refundRecordService = new RefundRecordService(prisma);
        const websocketSessionService = new WebsocketSessionService(prisma);

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

            Sentry.captureException(error);
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestBody);
        }

        console.log('parsed helius');

        for (const heliusTransaction of heliusEnhancedTransactions) {
            let paymentRecord: PaymentRecord | null = null;
            let refundRecord: RefundRecord | null = null;
            let websocketSessions: WebsocketSession[] | null = null;

            const paymentRecordAndWebsocketService =
                await paymentRecordService.getPaymentRecordAndWebsocketServiceForTransactionSignature(
                    heliusTransaction.signature
                );

            paymentRecord = paymentRecordAndWebsocketService.paymentRecord;
            websocketSessions = paymentRecordAndWebsocketService.websocketSessions;

            for (const websocketSession of websocketSessions) {
                try {
                    await sendWebsocketMessage(websocketSession.connectionId, {
                        messageType: 'processingTransaction',
                    });
                } catch (error) {
                    // prob just closed and orphaned
                    continue;
                }
            }

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

                // Ok lets focus on payments for now

                if (transactionRecord.paymentRecordId != null) {
                    paymentRecord = await paymentRecordService.getPaymentRecord({
                        id: transactionRecord.paymentRecordId,
                    });

                    if (paymentRecord == null) {
                        throw new Error('Payment record not found');
                    }

                    // TODO: Use real error
                    if (paymentRecord.merchantId == null) {
                        throw new Error('Merchant ID not found on payment record');
                    }

                    // TODO: Use real error
                    if (paymentRecord.shopGid == null) {
                        throw new Error('Shop gid not found on payment record');
                    }

                    await processDiscoveredPaymentTransaction(
                        paymentRecord,
                        heliusTransaction,
                        prisma,
                        websocketSessions
                    );
                } else if (transactionRecord.refundRecordId != null) {
                    refundRecord = await refundRecordService.getRefundRecord({
                        id: transactionRecord.refundRecordId,
                    });

                    if (refundRecord == null) {
                        throw new Error('Refund record not found');
                    }

                    // TODO: Use real error
                    if (refundRecord.merchantId == null) {
                        throw new Error('Merchant ID not found on refund record');
                    }

                    // TODO: Use real error
                    if (refundRecord.shopGid == null) {
                        throw new Error('Shop gid not found on refund record');
                    }

                    await processDiscoveredRefundTransaction(refundRecord, heliusTransaction, prisma);
                }
            } catch (error) {
                // We will catch here on odd throws, valuable catches should happen elsewhere
                // TODO: Add logging around these odd throws with Sentry

                for (const websocketSession of websocketSessions) {
                    try {
                        await sendWebsocketMessage(websocketSession.connectionId, {
                            messageType: 'failedProcessingTransaction',
                        });
                    } catch (error) {
                        // prob just closed and orphaned
                        continue;
                    }
                }

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
