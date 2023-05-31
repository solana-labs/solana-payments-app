import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PaymentRecord, PrismaClient, TransactionType } from '@prisma/client';
import { requestErrorResponse } from '../../utilities/responses/request-response.utility.js';
import { TransactionRequestResponse } from '../../models/transaction-requests/transaction-request-response.model.js';
import { fetchPaymentTransaction } from '../../services/transaction-request/fetch-payment-transaction.service.js';
import {
    PaymentTransactionRequestParameters,
    parseAndValidatePaymentTransactionRequest,
} from '../../models/transaction-requests/payment-transaction-request-parameters.model.js';
import { encodeBufferToBase58 } from '../../utilities/transaction-request/encode-transaction.utility.js';
import { encodeTransaction } from '../../utilities/transaction-request/encode-transaction.utility.js';
import { web3 } from '@project-serum/anchor';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { generateSingleUseKeypairFromPaymentRecord } from '../../utilities/generate-single-use-keypair.utility.js';
import { uploadSingleUseKeypair } from '../../services/upload-single-use-keypair.service.js';
import { TrmService } from '../../services/trm-service.service.js';
import * as Sentry from '@sentry/serverless';
import { verifyPaymentTransactionWithPaymentRecord } from '../../services/transaction-validation/validate-discovered-payment-transaction.service.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';
import axios from 'axios';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const paymentTransaction = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        let paymentTransaction: TransactionRequestResponse;
        let paymentRequest: PaymentTransactionRequestParameters;
        let transaction: web3.Transaction;

        const prisma = new PrismaClient();
        const transactionRecordService = new TransactionRecordService(prisma);
        const paymentRecordService = new PaymentRecordService(prisma);
        const merchantService = new MerchantService(prisma);

        const TRM_API_KEY = process.env.TRM_API_KEY;

        if (TRM_API_KEY == null) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.missingEnv);
        }

        const trmService = new TrmService(TRM_API_KEY);

        if (event.body == null) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.missingBody);
        }

        const body = JSON.parse(event.body);

        const account = body['account'] as string | null;

        if (account == null) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestBody);
        }

        try {
            paymentRequest = parseAndValidatePaymentTransactionRequest(event.queryStringParameters);
        } catch (error) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestParameters);
        }

        let gasKeypair: web3.Keypair;

        try {
            gasKeypair = await fetchGasKeypair();
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        }

        const paymentRecord = await paymentRecordService.getPaymentRecord({
            id: paymentRequest.paymentId,
        });

        if (paymentRecord == null) {
            return errorResponse(ErrorType.notFound, ErrorMessage.unknownPaymentRecord);
        }

        const merchant = await merchantService.getMerchant({
            id: paymentRecord.merchantId,
        });

        if (merchant == null) {
            // Not sure if this should be 500 or 404, will do 404 for now
            return errorResponse(ErrorType.notFound, ErrorMessage.unknownMerchant);
        }

        const singleUseKeypair = await generateSingleUseKeypairFromPaymentRecord(paymentRecord);

        // try {
        //     await uploadSingleUseKeypair(singleUseKeypair, paymentRecord);
        // } catch (error) {
        //     // TODO: Log this error in sentry
        //     return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        // }

        try {
            paymentTransaction = await fetchPaymentTransaction(
                paymentRecord,
                merchant,
                account,
                gasKeypair.publicKey.toBase58(),
                singleUseKeypair.publicKey.toBase58(),
                gasKeypair.publicKey.toBase58(),
                axios
            );
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        }

        try {
            await trmService.screenAddress(account);
        } catch (error) {
            // TODO: Check trm error code to see if it failed or was rejected, if it's failed we can try again
            // if it's rejected, we need to reject the payment sessions
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        }

        try {
            transaction = encodeTransaction(paymentTransaction.transaction);
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        }

        transaction.partialSign(gasKeypair);
        transaction.partialSign(singleUseKeypair);

        try {
            verifyPaymentTransactionWithPaymentRecord(paymentRecord, transaction, true);
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        }

        const transactionSignature = transaction.signature;

        if (transactionSignature == null) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        }

        const signatureBuffer = transactionSignature;

        const signatureString = encodeBufferToBase58(signatureBuffer);

        try {
            await transactionRecordService.createTransactionRecord(
                signatureString,
                TransactionType.payment,
                paymentRecord.id,
                null
            );
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
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
                    message: `Paying ${merchant.name} ${paymentRecord.usdcAmount.toFixed(2)} USDC`,
                },
                null,
                2
            ),
        };
    },
    {
        captureTimeoutWarning: false, // Adjust this according to your needs
    }
);

export const paymentMetadata = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                label: 'Solana Payment App',
                icon: 'https://solana.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FsolanaGradient.cc822962.png&w=3840&q=75',
            },
            null,
            2
        ),
    };
};
