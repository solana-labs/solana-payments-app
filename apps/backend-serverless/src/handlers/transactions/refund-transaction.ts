import { Merchant, PaymentRecord, PrismaClient, RefundRecord, TransactionType } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import * as web3 from '@solana/web3.js';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { DependencyError } from '../../errors/dependency.error.js';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import {
    RefundTransactionRequest,
    parseAndValidateRefundTransactionRequest,
} from '../../models/transaction-requests/refund-transaction-request.model.js';
import {
    TransactionRequestBody,
    parseAndValidateTransactionRequestBody,
} from '../../models/transaction-requests/transaction-request-body.model.js';
import { TransactionRequestResponse } from '../../models/transaction-requests/transaction-request-response.model.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { RefundRecordService } from '../../services/database/refund-record-service.database.service.js';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import { fetchRefundTransaction } from '../../services/transaction-request/fetch-refund-transaction.service.js';
import { verifyTransactionWithRecord } from '../../services/transaction-validation/validate-discovered-payment-transaction.service.js';
import { TrmService } from '../../services/trm-service.service.js';
import { generateSingleUseKeypairFromRecord } from '../../utilities/generate-single-use-keypair.utility.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';
import {
    encodeBufferToBase58,
    encodeTransaction,
} from '../../utilities/transaction-request/encode-transaction.utility.js';

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
        });
        let refundRequest: RefundTransactionRequest;
        let refundTransaction: TransactionRequestResponse;
        let transaction: web3.Transaction;

        const transactionRecordService = new TransactionRecordService(prisma);
        const refundRecordService = new RefundRecordService(prisma);
        const merchantService = new MerchantService(prisma);

        const trmService = new TrmService();

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('request body'));
        }

        const body = JSON.parse(event.body);

        let transactionRequestBody: TransactionRequestBody;

        try {
            transactionRequestBody = parseAndValidateTransactionRequestBody(JSON.parse(event.body));
        } catch (error) {
            return createErrorResponse(error);
        }
        const account = transactionRequestBody.account;

        if (account == null) {
            return createErrorResponse(new InvalidInputError('account is missing from body'));
        }

        try {
            new web3.PublicKey(account);
        } catch (error) {
            return createErrorResponse(new InvalidInputError('account is not a valid public key'));
        }

        try {
            refundRequest = parseAndValidateRefundTransactionRequest(event.queryStringParameters);
        } catch (error) {
            return createErrorResponse(error);
        }

        let gasKeypair: web3.Keypair;

        try {
            gasKeypair = await fetchGasKeypair();
        } catch (error) {
            return createErrorResponse(error);
        }

        let refundRecord: RefundRecord | null;

        try {
            refundRecord = await refundRecordService.getRefundRecord({
                shopId: refundRequest.refundId,
            });
        } catch (error) {
            return createErrorResponse(error);
        }

        if (refundRecord == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('refund record'));
        }

        let paymentRecord: PaymentRecord | null;

        try {
            paymentRecord = await refundRecordService.getPaymentRecordForRefund({ id: refundRecord.id });
        } catch (error) {
            return createErrorResponse(error);
        }

        if (paymentRecord == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('payment record'));
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({
                id: refundRecord.merchantId,
            });
        } catch (error) {
            return createErrorResponse(error);
        }

        if (merchant == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('merchant'));
        }

        const singleUseKeypair = await generateSingleUseKeypairFromRecord(refundRecord);

        try {
            refundTransaction = await fetchRefundTransaction(
                refundRecord,
                paymentRecord,
                account,
                gasKeypair.publicKey.toBase58(),
                singleUseKeypair.publicKey.toBase58(),
                gasKeypair.publicKey.toBase58(),
                axios
            );
        } catch (error) {
            return createErrorResponse(error);
        }

        try {
            transaction = encodeTransaction(refundTransaction.transaction);
        } catch (error) {
            return createErrorResponse(error);
        }

        transaction.partialSign(gasKeypair);

        const transactionSignature = transaction.signature;

        if (transactionSignature == null) {
            return createErrorResponse(new DependencyError('transaction signature null'));
        }

        try {
            verifyTransactionWithRecord(refundRecord, transaction, true);
        } catch (error) {
            return createErrorResponse(error);
        }

        const signatureBuffer = transactionSignature;

        const signatureString = encodeBufferToBase58(signatureBuffer);

        // We're gonna return bad for transactions here but we should probably just log it and handle this with the merchant in the backend
        if (refundRecord.test == false) {
            try {
                await trmService.screenAddress(account);
            } catch (error) {
                Sentry.captureException(new Error('Bad address for merchant: ' + merchant.id + ' ' + account));
                return createErrorResponse(
                    new InvalidInputError('wallet address in not able to be used. contact the solana pay team.')
                );
            }
        }

        try {
            await transactionRecordService.createTransactionRecord(
                signatureString,
                TransactionType.refund,
                null,
                refundRecord.id
            );
        } catch (error) {
            return createErrorResponse(error);
        }

        const transactionBuffer = transaction.serialize({
            verifySignatures: false,
            requireAllSignatures: false,
        });
        const transactionString = transactionBuffer.toString('base64');

        return {
            statusCode: 200,
            body: JSON.stringify(
                {
                    transaction: transactionString,
                    message: `Refunding customer ${refundRecord.usdcAmount.toFixed(2)} USDC`,
                },
                null,
                2
            ),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
