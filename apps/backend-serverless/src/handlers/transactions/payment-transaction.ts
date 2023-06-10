import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
    Merchant,
    PaymentRecord,
    PaymentRecordRejectionReason,
    PaymentRecordStatus,
    PrismaClient,
    TransactionType,
} from '@prisma/client';
import { TransactionRequestResponse } from '../../models/transaction-requests/transaction-request-response.model.js';
import { fetchPaymentTransaction } from '../../services/transaction-request/fetch-payment-transaction.service.js';
import {
    PaymentTransactionRequestParameters,
    parseAndValidatePaymentTransactionRequest,
} from '../../models/transaction-requests/payment-transaction-request-parameters.model.js';
import { encodeBufferToBase58 } from '../../utilities/transaction-request/encode-transaction.utility.js';
import { encodeTransaction } from '../../utilities/transaction-request/encode-transaction.utility.js';
import * as web3 from '@solana/web3.js';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { generateSingleUseKeypairFromPaymentRecord } from '../../utilities/generate-single-use-keypair.utility.js';
import { TrmService } from '../../services/trm-service.service.js';
import * as Sentry from '@sentry/serverless';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';
import axios from 'axios';
import { RiskyWalletError } from '../../errors/risky-wallet.error.js';
import { makePaymentSessionReject } from '../../services/shopify/payment-session-reject.service.js';
import { sendPaymentRejectRetryMessage } from '../../services/sqs/sqs-send-message.service.js';
import { validatePaymentSessionRejected } from '../../services/shopify/validate-payment-session-rejected.service.js';
import { PaymentSessionStateRejectedReason } from '../../models/shopify-graphql-responses/shared.model.js';
import { uploadSingleUseKeypair } from '../../services/upload-single-use-keypair.service.js';
import { WebsocketSessionService } from '../../services/database/websocket.database.service.js';
import { sendWebsocketMessage } from '../../services/websocket/send-websocket-message.service.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const paymentTransaction = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        let paymentTransaction: TransactionRequestResponse;
        let paymentRequest: PaymentTransactionRequestParameters;
        let transaction: web3.Transaction;

        const transactionRecordService = new TransactionRecordService(prisma);
        const paymentRecordService = new PaymentRecordService(prisma);
        const merchantService = new MerchantService(prisma);
        const websocketSessionService = new WebsocketSessionService(prisma);

        const TRM_API_KEY = process.env.TRM_API_KEY;

        if (TRM_API_KEY == null) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.missingEnv);
        }

        const trmService = new TrmService(TRM_API_KEY);

        if (event.body == null) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.missingBody);
        }

        const body = JSON.parse(event.body);

        // TODO: Parse the body like everything else
        const account = body['account'] as string | null;

        if (account == null) {
            console.log('account is null');
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestBody);
        }

        try {
            paymentRequest = parseAndValidatePaymentTransactionRequest(event.queryStringParameters);
        } catch (error) {
            console.log('error parsing payment request');
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestParameters);
        }

        let gasKeypair: web3.Keypair;

        let paymentRecord: PaymentRecord | null;

        try {
            paymentRecord = await paymentRecordService.getPaymentRecord({
                id: paymentRequest.paymentId,
            });
        } catch (error) {
            console.log('error fetching payment record');
            return errorResponse(ErrorType.internalServerError, ErrorMessage.databaseAccessError);
        }

        if (paymentRecord == null) {
            console.log('payment record is null');
            return errorResponse(ErrorType.notFound, ErrorMessage.unknownPaymentRecord);
        }

        if (paymentRecord.shopGid == null) {
            console.log('shop gid is null');
            return errorResponse(ErrorType.conflict, ErrorMessage.incompatibleDatabaseRecords);
        }

        const websocketSession = await websocketSessionService.getWebsocketSession({
            paymentRecordId: paymentRecord.id,
        });

        if (websocketSession == null) {
            return errorResponse(ErrorType.conflict, ErrorMessage.incompatibleDatabaseRecords);
        }

        // If this fails, it's concerning but not the end of the world, TODO
        await sendWebsocketMessage(websocketSession.connectionId, {
            messageType: 'transactionRequest:started',
        });

        try {
            gasKeypair = await fetchGasKeypair();
        } catch (error) {
            console.log('error fetching gas keypair', error, error.message);
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({
                id: paymentRecord.merchantId,
            });
        } catch (error) {
            console.log('error fetching merchant');
            return errorResponse(ErrorType.internalServerError, ErrorMessage.databaseAccessError);
        }

        if (merchant == null) {
            // Not sure if this should be 500 or 404, will do 404 for now
            console.log('merchant is null');
            return errorResponse(ErrorType.notFound, ErrorMessage.unknownMerchant);
        }

        if (merchant.accessToken == null) {
            console.log('merchant access token is null');
            return errorResponse(ErrorType.conflict, ErrorMessage.incompatibleDatabaseRecords);
        }

        const singleUseKeypair = await generateSingleUseKeypairFromPaymentRecord(paymentRecord);

        try {
            await uploadSingleUseKeypair(singleUseKeypair, paymentRecord);
        } catch (error) {
            // TODO: Log this error in sentry
            // TODO: Prob dont crash here, fail ez, nbd
        }

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
            console.log('error fetching payment transaction', error.message);
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        }

        // We don't need to check with TRM for test transactions
        if (paymentRecord.test == false) {
            // TODO: Clean this up
            try {
                await trmService.screenAddress(account);
            } catch (error) {
                let rejectionReason: PaymentSessionStateRejectedReason =
                    PaymentSessionStateRejectedReason.processingError;

                if (error instanceof RiskyWalletError) {
                    rejectionReason = PaymentSessionStateRejectedReason.risky;
                }

                const paymentSessionReject = makePaymentSessionReject(axios);

                let paymentSessionData: { redirectUrl: string };

                try {
                    const paymentSessionRejectResponse = await paymentSessionReject(
                        paymentRecord.shopGid,
                        rejectionReason,
                        merchant.shop,
                        merchant.accessToken
                    );

                    paymentSessionData = validatePaymentSessionRejected(paymentSessionRejectResponse);

                    try {
                        paymentRecord = await paymentRecordService.updatePaymentRecord(paymentRecord, {
                            status: PaymentRecordStatus.rejected,
                            redirectUrl: paymentSessionData.redirectUrl,
                            completedAt: new Date(),
                            rejectionReason: PaymentRecordRejectionReason.customerSafetyReason, // Todo, make this more dynamic once we have location
                        });
                    } catch (error) {
                        // TODO: Handle the database update failing here
                    }
                } catch (error) {
                    try {
                        await sendPaymentRejectRetryMessage(paymentRecord.id, rejectionReason);
                    } catch (error) {
                        // TODO: This would be an odd error to hit, sending messages to the queue shouldn't fail. It will be good to log this
                        // with sentry and figure out why it happened. Also good to figure out some kind of redundancy here. Also good to
                        // build in a way to manually intervene here if needed.
                    }
                }

                // TODO: What to do if this fails? If it fail's they're likely gonna go into the
                // reconnect flow and we will let them know there.
                sendWebsocketMessage(websocketSession.connectionId, {
                    messageType: 'errorDetails',
                    errorDetails: {
                        errorTitle: 'Could not process payment.',
                        errorDetail:
                            'It looks like your wallet has been flagged for suspicious activity. We are not able to process your payment at this time. Please go back and try another method.',
                        errorRedirect: paymentRecord.redirectUrl ?? paymentRecord.cancelURL,
                    },
                });

                // TODO: Better error response
                return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
            }
        }

        sendWebsocketMessage(websocketSession.connectionId, {
            messageType: 'errorDetails',
            errorDetails: {
                errorTitle: 'Could not process payment.',
                errorDetail:
                    'It looks like your wallet has been flagged for suspicious activity. We are not able to process your payment at this time. Please go back and try another method.',
                errorRedirect: paymentRecord.redirectUrl ?? paymentRecord.cancelURL,
            },
        });

        return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);

        try {
            transaction = encodeTransaction(paymentTransaction.transaction);
        } catch (error) {
            console.log('error encoding transaction');
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        }

        transaction.partialSign(gasKeypair);
        transaction.partialSign(singleUseKeypair);

        // TODO: Idk why this is commented out but we should remove it soon, i think it was a local thing
        // TODO: FIX THIS
        // try {
        //     verifyPaymentTransactionWithPaymentRecord(paymentRecord, transaction, true);
        // } catch (error) {
        //     return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        // }

        const transactionSignature = transaction.signature;

        if (transactionSignature == null) {
            console.log('transaction signature is null');
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
            console.log('error creating transaction record');
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        }

        const transactionBuffer = transaction.serialize({
            verifySignatures: false,
            requireAllSignatures: false,
        });
        const transactionString = transactionBuffer.toString('base64');

        return {
            statusCode: 200,
            body: JSON.stringify({
                transaction: transactionString,
                message: `Paying ${merchant.name} ${paymentRecord.usdcAmount.toFixed(6)} USDC`,
            }),
        };
    },
    {
        captureTimeoutWarning: false, // Adjust this according to your needs
        rethrowAfterCapture: true,
    }
);

export const paymentMetadata = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            label: 'Solana Payment App',
        }),
    };
};
