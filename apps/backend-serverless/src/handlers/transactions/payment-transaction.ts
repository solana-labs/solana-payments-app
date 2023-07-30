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
import { DatabaseAccessError } from '../../errors/database-access.error.js';
import { DependencyError } from '../../errors/dependency.error.js';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { RiskyWalletError } from '../../errors/risky-wallet.error.js';
import { PaymentSessionStateRejectedReason } from '../../models/shopify-graphql-responses/shared.model.js';
import {
    PaymentRequestParameters,
    parseAndValidatePaymentRequest,
} from '../../models/transaction-requests/payment-request-parameters.model.js';
import { parseAndValidateTransactionRequestBody } from '../../models/transaction-requests/transaction-request-body.model.js';
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
import {
    verifyTransactionWithRecord,
    verifyTransactionWithRecordPoints,
} from '../../services/transaction-validation/validate-discovered-payment-transaction.service.js';
import { TrmService } from '../../services/trm-service.service.js';
import { uploadSingleUseKeypair } from '../../services/upload-single-use-keypair.service.js';
import { WebSocketService } from '../../services/websocket/send-websocket-message.service.js';
import { createCustomerResponse } from '../../utilities/clients/create-customer-response.js';
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
                event,
            },
        });

        const transactionRecordService = new TransactionRecordService(prisma);
        const paymentRecordService = new PaymentRecordService(prisma);
        const merchantService = new MerchantService(prisma);
        const websocketSessionService = new WebsocketSessionService(prisma);

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('request body'));
        }
        const websocketUrl = process.env.WEBSOCKET_URL;

        if (websocketUrl == null) {
            return createErrorResponse(new MissingEnvError('websocket url'));
        }

        let paymentRecord: PaymentRecord;
        let account: string;
        let merchant: Merchant;
        let websocketService;
        let gasKeypair: web3.Keypair;
        let singleUseKeypair: web3.Keypair;
        let paymentRequest: PaymentRequestParameters;

        try {
            let transactionRequestBody = parseAndValidateTransactionRequestBody(JSON.parse(event.body));
            account = transactionRequestBody.account;

            paymentRequest = parseAndValidatePaymentRequest(event.queryStringParameters);

            paymentRecord = await paymentRecordService.getPaymentRecord({
                id: paymentRequest.paymentId,
            });
            merchant = await merchantService.getMerchant({
                id: paymentRecord.merchantId,
            });

            if (merchant.accessToken == null) {
                throw new DatabaseAccessError('missing access token');
            }

            websocketService = new WebSocketService(
                websocketUrl,
                {
                    paymentRecordId: paymentRecord.id,
                },
                websocketSessionService
            );

            await websocketService.sendTransacationRequestStartedMessage();
            await sendSolanaPayInfoMessage(account, paymentRecord.id);
        } catch (error) {
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
            singleUseKeypair = await generateSingleUseKeypairFromRecord(paymentRecord);
            try {
                await uploadSingleUseKeypair(singleUseKeypair, paymentRecord);
            } catch (error) {
                Sentry.captureException(error);
            }
            gasKeypair = await fetchGasKeypair();
            console.log('got the gas keypair', gasKeypair.publicKey.toBase58());

            const customerResponse = await createCustomerResponse(account, paymentRecord, merchantService);
            console.log('\n\n\n about to fetch payment transaction \n\n\n');
            let paymentTransaction = await fetchPaymentTransaction(
                paymentRecord,
                merchant,
                account,
                gasKeypair.publicKey.toBase58(),
                singleUseKeypair.publicKey.toBase58(),
                gasKeypair.publicKey.toBase58(),
                paymentRequest.payWithPoints,
                customerResponse
            );
            console.log('got the payemtn transactio', paymentTransaction.transaction);

            let transaction = encodeTransaction(paymentTransaction.transaction);
            console.log('encoded the transaction', transaction);
            transaction.partialSign(gasKeypair);
            console.log('partial signed');
            if (paymentRequest.payWithPoints) {
                verifyTransactionWithRecordPoints(paymentRecord, transaction, true);
            } else {
                verifyTransactionWithRecord(paymentRecord, transaction, true);
            }
            console.log('verified tx');

            const transactionSignature = transaction.signature;
            if (transactionSignature == null) {
                throw new DependencyError('transaction signature');
            }
            console.log('got the tx sig', transactionSignature);

            await transactionRecordService.createTransactionRecord(
                encodeBufferToBase58(transactionSignature),
                TransactionType.payment,
                paymentRecord.id,
                null,
                paymentRequest.payWithPoints
            );
            console.log('created tx record');
            const transactionBuffer = transaction.serialize({
                verifySignatures: false,
                requireAllSignatures: false,
            });

            await websocketService.sendTransactionDeliveredMessage();

            return {
                statusCode: 200,
                body: JSON.stringify({
                    transaction: transactionBuffer.toString('base64'),
                    message: `Paying ${merchant.name} ${paymentRecord.usdcAmount.toFixed(6)} USDC`,
                }),
            };
        } catch (error) {
            await websocketService.sendTransactionRequestFailedMessage();
            return createErrorResponse(error);
        }
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
