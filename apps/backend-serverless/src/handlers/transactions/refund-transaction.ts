import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Merchant, PaymentRecord, PrismaClient, RefundRecord, TransactionType } from '@prisma/client';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import {
    RefundTransactionRequest,
    parseAndValidateRefundTransactionRequest,
} from '../../models/transaction-requests/refund-transaction-request.model.js';
import * as web3 from '@solana/web3.js';
import { TransactionRequestResponse } from '../../models/transaction-requests/transaction-request-response.model.js';
import {
    encodeBufferToBase58,
    encodeTransaction,
} from '../../utilities/transaction-request/encode-transaction.utility.js';
import { fetchRefundTransaction } from '../../services/transaction-request/fetch-refund-transaction.service.js';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import { RefundRecordService } from '../../services/database/refund-record-service.database.service.js';
import { TrmService } from '../../services/trm-service.service.js';
import { generateSingleUseKeypairFromRefundRecord } from '../../utilities/generate-single-use-keypair.utility.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import {
    ErrorMessage,
    ErrorType,
    createErrorResponse,
    errorResponse,
} from '../../utilities/responses/error-response.utility.js';
import axios from 'axios';
import { verifyTransactionWithRecord } from '../../services/transaction-validation/validate-discovered-payment-transaction.service.js';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { create } from 'lodash';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import { DependencyError } from '../../errors/dependency.error.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const refundTransaction = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

        // TODO: Parse this like everything else
        const account = body['account'] as string | null;

        if (account == null) {
            return createErrorResponse(new InvalidInputError('account is missing from body'));
        }

        try {
            refundRequest = parseAndValidateRefundTransactionRequest(event.queryStringParameters);
        } catch (error) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestParameters);
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

        const singleUseKeypair = await generateSingleUseKeypairFromRefundRecord(refundRecord);

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

        // I'm not sure we should do this for merchant refunds
        // We don't need to check with TRM for test transactions
        // We probably want to but TODO on what the output should be
        if (refundRecord.test == false) {
            try {
                await trmService.screenAddress(account);
            } catch (error) {
                return createErrorResponse(error);
            }
        }

        try {
            transaction = encodeTransaction(refundTransaction.transaction);
        } catch (error) {
            return createErrorResponse(error);
        }

        transaction.partialSign(gasKeypair);
        transaction.partialSign(singleUseKeypair);

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
        rethrowAfterCapture: true,
    }
);
