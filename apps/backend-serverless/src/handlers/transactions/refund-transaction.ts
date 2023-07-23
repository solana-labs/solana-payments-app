import { Merchant, PaymentRecord, PrismaClient, RefundRecord, TransactionType } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import * as web3 from '@solana/web3.js';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { DependencyError } from '../../errors/dependency.error';
import { InvalidInputError } from '../../errors/invalid-input.error';
import {
    RefundTransactionRequest,
    parseAndValidateRefundTransactionRequest,
} from '../../models/transaction-requests/refund-transaction-request.model';
import { parseAndValidateTransactionRequestBody } from '../../models/transaction-requests/transaction-request-body.model';
import { MerchantService } from '../../services/database/merchant-service.database.service';
import { RefundRecordService } from '../../services/database/refund-record-service.database.service';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service';
import { fetchRefundTransaction } from '../../services/transaction-request/fetch-refund-transaction.service';
import { verifyTransactionWithRecord } from '../../services/transaction-validation/validate-discovered-payment-transaction.service';
import { TrmService } from '../../services/trm-service.service';
import { generateSingleUseKeypairFromRecord } from '../../utilities/generate-single-use-keypair.utility';
import { createErrorResponse } from '../../utilities/responses/error-response.utility';
import {
    encodeBufferToBase58,
    encodeTransaction,
} from '../../utilities/transaction-request/encode-transaction.utility';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const refundTransaction = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in refund-transaction',
            level: 'info',
            extra: {
                event,
            },
        });
        let refundRequest: RefundTransactionRequest;

        const transactionRecordService = new TransactionRecordService(prisma);
        const refundRecordService = new RefundRecordService(prisma);
        const merchantService = new MerchantService(prisma);

        const trmService = new TrmService();

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('request body'));
        }

        let account: string;
        let gasKeypair: web3.Keypair;
        let refundRecord: RefundRecord;
        let paymentRecord: PaymentRecord;
        let merchant: Merchant | null;

        try {
            let transactionRequestBody = parseAndValidateTransactionRequestBody(JSON.parse(event.body));
            account = transactionRequestBody.account;

            refundRequest = parseAndValidateRefundTransactionRequest(event.queryStringParameters);

            refundRecord = await refundRecordService.getRefundRecord({
                shopId: refundRequest.refundId,
            });
            paymentRecord = await refundRecordService.getPaymentRecordForRefund({ id: refundRecord.id });
            merchant = await merchantService.getMerchant({
                id: refundRecord.merchantId,
            });
        } catch (error) {
            return createErrorResponse(error);
        }

        // We're gonna return bad for transactions here but we should probably just log it and handle this with the merchant in the backend
        if (refundRecord.test == false) {
            try {
                await trmService.screenAddress(account);
            } catch (error) {
                return createErrorResponse(
                    new InvalidInputError('Bad address for merchant: ' + merchant.id + ' ' + account)
                );
            }
        }

        try {
            const singleUseKeypair = await generateSingleUseKeypairFromRecord(refundRecord);
            gasKeypair = await fetchGasKeypair();

            let refundTransaction = await fetchRefundTransaction(
                refundRecord,
                paymentRecord,
                account,
                gasKeypair.publicKey.toBase58(),
                singleUseKeypair.publicKey.toBase58(),
                gasKeypair.publicKey.toBase58(),
                axios
            );

            let transaction = encodeTransaction(refundTransaction.transaction);
            transaction.partialSign(gasKeypair);
            verifyTransactionWithRecord(refundRecord, transaction, true);

            const transactionSignature = transaction.signature;
            if (transactionSignature == null) {
                throw new DependencyError('transaction signature null');
            }

            Sentry.captureEvent({
                message: 'in refund-transaction verify tx w record',
                level: 'info',
            });
            await transactionRecordService.createTransactionRecord(
                encodeBufferToBase58(transactionSignature),
                TransactionType.refund,
                null,
                refundRecord.id
            );
            const transactionBuffer = transaction.serialize({
                verifySignatures: false,
                requireAllSignatures: false,
            });

            Sentry.captureEvent({
                message: 'refund-tx about to finalize',
                level: 'info',
            });
            return {
                statusCode: 200,
                body: JSON.stringify(
                    {
                        transaction: transactionBuffer.toString('base64'),
                        message: `Refunding customer ${refundRecord.usdcAmount.toFixed(2)} USDC`,
                    },
                    null,
                    2
                ),
            };
        } catch (error) {
            return await createErrorResponse(error);
        }
    },
    {
        rethrowAfterCapture: false,
    }
);
