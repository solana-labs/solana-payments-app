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
import {
    ErrorMessage,
    ErrorType,
    createErrorResponse,
    errorResponse,
} from '../../utilities/responses/error-response.utility.js';
import axios from 'axios';
import { RiskyWalletError } from '../../errors/risky-wallet.error.js';
import { makePaymentSessionReject } from '../../services/shopify/payment-session-reject.service.js';
import {
    sendPaymentRejectRetryMessage,
    sendSolanaPayInfoMessage,
} from '../../services/sqs/sqs-send-message.service.js';
import { validatePaymentSessionRejected } from '../../services/shopify/validate-payment-session-rejected.service.js';
import { PaymentSessionStateRejectedReason } from '../../models/shopify-graphql-responses/shared.model.js';
import { uploadSingleUseKeypair } from '../../services/upload-single-use-keypair.service.js';
import { WebsocketSessionService } from '../../services/database/websocket.database.service.js';
import { WebSocketService } from '../../services/websocket/send-websocket-message.service.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
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

export const paymentTransaction = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        let paymentTransaction: TransactionRequestResponse;
        let paymentRequest: PaymentTransactionRequestParameters;
        let transaction: web3.Transaction;

        const transactionRecordService = new TransactionRecordService(prisma);
        const paymentRecordService = new PaymentRecordService(prisma);
        const merchantService = new MerchantService(prisma);
        const websocketSessionService = new WebsocketSessionService(prisma);

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('request body'));
        }

        const body = JSON.parse(event.body);

        // TODO: Parse the body like everything else
        const account = body['account'] as string | null;

        if (account == null) {
            return createErrorResponse(new InvalidInputError('missing account in body'));
        }

        try {
            paymentRequest = parseAndValidatePaymentTransactionRequest(event.queryStringParameters);
        } catch (error) {
            return createErrorResponse(error);
        }

        let gasKeypair: web3.Keypair;

        let paymentRecord: PaymentRecord | null;

        try {
            paymentRecord = await paymentRecordService.getPaymentRecord({
                id: paymentRequest.paymentId,
            });
        } catch (error) {
            return createErrorResponse(error);
        }

        if (paymentRecord == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('payment record'));
        }

        const websocketUrl = process.env.WEBSOCKET_URL;

        if (websocketUrl == null) {
            return createErrorResponse(new MissingEnvError('websocket url'));
        }

        const websocketService = new WebSocketService(
            websocketUrl,
            {
                paymentRecordId: paymentRecord.id,
            },
            websocketSessionService
        );

        await websocketService.sendTransacationRequestStartedMessage();

        await sendSolanaPayInfoMessage(account, paymentRecord.id);

        try {
            gasKeypair = await fetchGasKeypair();
        } catch (error) {
            console.log('no gas');
            await websocketService.sendTransactionRequestFailedMessage();
            return createErrorResponse(error);
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({
                id: paymentRecord.merchantId,
            });
        } catch (error) {
            console.log('failed fetching merchant');
            await websocketService.sendTransactionRequestFailedMessage();
            return createErrorResponse(error);
        }

        if (merchant == null) {
            console.log('no merchant');
            await websocketService.sendTransactionRequestFailedMessage();
            return createErrorResponse(new MissingExpectedDatabaseRecordError('merchant'));
        }

        if (merchant.accessToken == null) {
            await websocketService.sendTransactionRequestFailedMessage();
            console.log('no access token');
            return createErrorResponse(new MissingExpectedDatabaseRecordError('merchant access token'));
        }

        const singleUseKeypair = await generateSingleUseKeypairFromPaymentRecord(paymentRecord);

        try {
            await uploadSingleUseKeypair(singleUseKeypair, paymentRecord);
        } catch (error) {
            Sentry.captureException(error);
            // TODO: Could we retry this?
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
            console.log(error);
            console.log('failed fetching payment transaction, prob lol');
            await websocketService.sendTransactionRequestFailedMessage();
            return createErrorResponse(error);
        }

        // TODO: Clean this up
        if (paymentRecord.test == false) {
            const trmService = new TrmService();

            try {
                await trmService.screenAddress(account);
            } catch (error) {
                let rejectionReason = PaymentSessionStateRejectedReason.processingError;

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
                        // TODO: Should we retry this? We should probably retry this? idk
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

                await websocketService.sendErrorDetailsMessage({
                    errorTitle: 'Could not process payment.',
                    errorDetail:
                        'It looks like your wallet has been flagged for suspicious activity. We are not able to process your payment at this time. Please go back and try another method.',
                    errorRedirect: paymentRecord.redirectUrl ?? paymentRecord.cancelURL,
                });

                return createErrorResponse(error);
            }
        }

        try {
            transaction = encodeTransaction(paymentTransaction.transaction);
        } catch (error) {
            await websocketService.sendTransactionRequestFailedMessage();
            return createErrorResponse(error);
        }

        transaction.partialSign(gasKeypair);
        transaction.partialSign(singleUseKeypair);

        try {
            verifyTransactionWithRecord(paymentRecord, transaction, true);
        } catch (error) {
            return createErrorResponse(error);
        }

        const transactionSignature = transaction.signature;

        if (transactionSignature == null) {
            await websocketService.sendTransactionRequestFailedMessage();
            return createErrorResponse(new DependencyError('transaction signature'));
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
            await websocketService.sendTransactionRequestFailedMessage();
            return createErrorResponse(error);
        }

        const transactionBuffer = transaction.serialize({
            verifySignatures: false,
            requireAllSignatures: false,
        });
        const transactionString = transactionBuffer.toString('base64');

        await websocketService.sendTransactionDeliveredMessage();

        return {
            statusCode: 200,
            body: JSON.stringify({
                transaction: transactionString,
                message: `Paying ${merchant.name} ${paymentRecord.usdcAmount.toFixed(6)} USDC`,
            }),
        };
    },
    {
        captureTimeoutWarning: false,
        rethrowAfterCapture: true,
    }
);

export const paymentMetadata = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            label: 'Solana Payment App',
            icon: 'https://s2.coinmarketcap.com/static/img/coins/200x200/5426.png', // TODO: Update this image to something we host on AWS
        }),
    };
};
