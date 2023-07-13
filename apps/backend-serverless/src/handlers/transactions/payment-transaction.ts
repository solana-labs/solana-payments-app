import {
    Merchant,
    PaymentRecord,
    PaymentRecordRejectionReason,
    PaymentRecordStatus,
    PrismaClient,
    TransactionType,
} from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import * as web3 from '@solana/web3.js';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { DependencyError } from '../../errors/dependency.error.js';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import { RiskyWalletError } from '../../errors/risky-wallet.error.js';
import { PaymentSessionStateRejectedReason } from '../../models/shopify-graphql-responses/shared.model.js';
import { parseAndValidatePaymentRequest } from '../../models/transaction-requests/payment-request-parameters.model.js';
import {
    TransactionRequestBody,
    parseAndValidateTransactionRequestBody,
} from '../../models/transaction-requests/transaction-request-body.model.js';
import { TransactionRequestResponse } from '../../models/transaction-requests/transaction-request-response.model.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import { WebsocketSessionService } from '../../services/database/websocket.database.service.js';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import { makePaymentSessionReject } from '../../services/shopify/payment-session-reject.service.js';
import { validatePaymentSessionRejected } from '../../services/shopify/validate-payment-session-rejected.service.js';
import {
    sendPaymentRejectRetryMessage,
    sendSolanaPayInfoMessage,
} from '../../services/sqs/sqs-send-message.service.js';
import { fetchPaymentTransaction } from '../../services/transaction-request/fetch-payment-transaction.service.js';
import { verifyTransactionWithRecord } from '../../services/transaction-validation/validate-discovered-payment-transaction.service.js';
import { TrmService } from '../../services/trm-service.service.js';
import { uploadSingleUseKeypair } from '../../services/upload-single-use-keypair.service.js';
import { WebSocketService } from '../../services/websocket/send-websocket-message.service.js';
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

export const paymentTransaction = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'In payment transaction handler',
            level: 'info',
            extra: {
                event: JSON.stringify(event),
            },
        });
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

        let transactionRequestBody: TransactionRequestBody;

        try {
            transactionRequestBody = parseAndValidateTransactionRequestBody(JSON.parse(event.body));
        } catch (error) {
            return createErrorResponse(error);
        }
        const account = transactionRequestBody.account;

        if (account == null) {
            return createErrorResponse(new InvalidInputError('missing account in body'));
        }

        if (account != null) {
            try {
                const accountPubkey = new web3.PublicKey(account);
            } catch (error) {
                return createErrorResponse(new InvalidInputError('invalid account in body. needs to be a pubkey'));
            }
        }

        try {
            paymentRequest = parseAndValidatePaymentRequest(event.queryStringParameters);
        } catch (error) {
            return createErrorResponse(error);
        }

        let gasKeypair: web3.Keypair;

        let paymentRecord: PaymentRecord | null;

        try {
            paymentRecord = await paymentRecordService.getPaymentRecord({
                id: paymentRequest.id,
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
            console.log('no gas keypair');
            await websocketService.sendTransactionRequestFailedMessage();
            return createErrorResponse(error);
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({
                id: paymentRecord.merchantId,
            });
        } catch (error) {
            await websocketService.sendTransactionRequestFailedMessage();
            return createErrorResponse(error);
        }

        if (merchant == null) {
            await websocketService.sendTransactionRequestFailedMessage();
            return createErrorResponse(new MissingExpectedDatabaseRecordError('merchant'));
        }

        if (merchant.accessToken == null) {
            await websocketService.sendTransactionRequestFailedMessage();
            return createErrorResponse(new MissingExpectedDatabaseRecordError('merchant access token'));
        }

        const singleUseKeypair = await generateSingleUseKeypairFromRecord(paymentRecord);

        try {
            await uploadSingleUseKeypair(singleUseKeypair, paymentRecord);
        } catch (error) {
            Sentry.captureException(error);
            // CRITIAL: This should work, but losing the rent here isn't the end of the world but we want to know
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
                            rejectionReason: PaymentRecordRejectionReason.customerSafetyReason,
                        });
                    } catch (error) {
                        // CRITICAL: Add to database failure queue
                        // We will log this error underneath so no need to do this here, shopify already knows what is good and big
                        // We don't want to throw though becuase throwing would make us retry with shopify and im not sure thats how we want to handle this
                    }
                } catch (error) {
                    try {
                        await sendPaymentRejectRetryMessage(paymentRecord.id, rejectionReason);
                    } catch {
                        // This is bad but we should be logging this error underneath so no need to do it here
                        // CRITICAL: Add this to the critical error database
                    }
                }

                // CRITICAL: Add this to the failed message queue
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
        // transaction.partialSign(singleUseKeypair);

        try {
            verifyTransactionWithRecord(paymentRecord, transaction, true);
        } catch (error) {
            console.log(error);
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
        rethrowAfterCapture: false,
    }
);

export const paymentMetadata = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            label: 'Solana Payment App',
            icon: 'https://s2.coinmarketcap.com/static/img/coins/200x200/5426.png', // TODO: Update this image to something we host on AWS
        }),
    };
};
