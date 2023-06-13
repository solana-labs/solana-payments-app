import {
    ErrorResponseUseCase,
    HandlerCoreFunctionUseCaseInterface,
    HandlerErrorUseCase,
    HandlerTaskChain,
    InputValidationUseCase,
} from '../use-cases-and-task-chain.wip.js';
import { ParseAndValidateUseCase } from '../use-cases-and-task-chain.wip.js';
import {
    parseAndValidateTransactionRequestBody,
    TransactionRequestBody,
} from '../../models/transaction-requests/transaction-request-body.model.js';
import {
    parseAndValidatePaymentTransactionRequest,
    TransactionRequestParameters,
} from '../../models/transaction-requests/payment-transaction-request-parameters.model.js';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import * as web3 from '@solana/web3.js';
import {
    Merchant,
    PaymentRecord,
    PaymentRecordRejectionReason,
    PaymentRecordStatus,
    PrismaClient,
    TransactionType,
} from '@prisma/client';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { WebsocketSessionService } from '../../services/database/websocket.database.service.js';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import {
    generateSingleUseKeypairFromPaymentRecord,
    generateSingleUseKeypairFromRecord,
} from '../../utilities/generate-single-use-keypair.utility.js';
import { uploadSingleUseKeypair } from '../../services/upload-single-use-keypair.service.js';
import { TransactionRequestResponse } from '../../models/transaction-requests/transaction-request-response.model.js';
import { fetchPaymentTransaction } from '../../services/transaction-request/fetch-payment-transaction.service.js';
import axios from 'axios';
import { TrmService } from '../../services/trm-service.service.js';
import { PaymentSessionStateRejectedReason } from '../../models/shopify-graphql-responses/shared.model.js';
import { RiskyWalletError } from '../../errors/risky-wallet.error.js';
import { makePaymentSessionReject } from '../../services/shopify/payment-session-reject.service.js';
import { validatePaymentSessionRejected } from '../../services/shopify/validate-payment-session-rejected.service.js';
import { sendPaymentRejectRetryMessage } from '../../services/sqs/sqs-send-message.service.js';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import {
    encodeBufferToBase58,
    encodeTransaction,
} from '../../utilities/transaction-request/encode-transaction.utility.js';
import { WebSocketService } from '../../services/websocket/send-websocket-message.service.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { createErrorResponse, errorResponse } from '../../utilities/responses/error-response.utility.js';
import {
    RecordService,
    ShopifyRecord,
    ShopifyRejectResponse,
    ShopifyResolveResponse,
} from '../../services/database/record-service.database.service.js';
import { fetchRecordTransaction } from '../../services/transaction-request/fetch-transaction.service.js';

export const paymentTransactionCoreUseCaseMethod = async (
    _: {},
    body: TransactionRequestBody,
    queryParameter: PaymentTransactionRequestParameters,
    dependencies: { prisma: PrismaClient; axiosInstance: typeof axios }
): Promise<APIGatewayProxyResultV2> => {
    const paymentRecordService = new PaymentRecordService(dependencies.prisma);
    const websocketSessionService = new WebsocketSessionService(dependencies.prisma);
    const merchantService = new MerchantService(dependencies.prisma);
    const transactionRecordService = new TransactionRecordService(dependencies.prisma);
    let paymentTransaction: TransactionRequestResponse;
    let transaction: web3.Transaction;

    let gasKeypair: web3.Keypair;
    let paymentRecord: PaymentRecord | null;

    try {
        paymentRecord = await paymentRecordService.getPaymentRecord({
            id: queryParameter.paymentId,
        });
    } catch (error) {
        console.log('error fetching payment record');
        throw new Error('error fetching payment record');
    }

    if (paymentRecord == null) {
        console.log('payment record is null');
        throw new Error('error fetching payment record');
    }

    const websocketUrl = process.env.WEBSOCKET_URL;

    if (websocketUrl == null) {
        throw new MissingEnvError('websocket url');
    }

    const websocketSession = new WebSocketService(
        websocketUrl,
        {
            paymentRecordId: paymentRecord.id,
        },
        websocketSessionService
    );

    await websocketSession.sendTransacationRequestStartedMessage();

    try {
        gasKeypair = await fetchGasKeypair();
    } catch (error) {
        console.log('error fetching gas keypair', error, error.message);
        throw new Error('error fetching gas keypair');
    }

    let merchant: Merchant | null;

    try {
        merchant = await merchantService.getMerchant({
            id: paymentRecord.merchantId,
        });
    } catch (error) {
        console.log('error fetching merchant');
        throw new Error('error fetching merchant');
    }

    if (merchant == null) {
        // Not sure if this should be 500 or 404, will do 404 for now
        console.log('merchant is null');
        throw new Error('merchant is null');
    }

    if (merchant.accessToken == null) {
        console.log('merchant access token is null');
        throw new Error('merchant access token is null');
    }

    const singleUseKeypair = await generateSingleUseKeypairFromPaymentRecord(paymentRecord);

    try {
        await uploadSingleUseKeypair(singleUseKeypair, paymentRecord);
    } catch (error) {
        console.log('could not upload single use keypair');
        // TODO: Log this error in sentry
        // TODO: Prob dont crash here, fail ez, nbd
    }

    try {
        paymentTransaction = await fetchPaymentTransaction(
            paymentRecord,
            merchant,
            body.account,
            gasKeypair.publicKey.toBase58(),
            singleUseKeypair.publicKey.toBase58(),
            gasKeypair.publicKey.toBase58(),
            dependencies.axiosInstance
        );
    } catch (error) {
        console.log('error fetching payment transaction', error.message);
        throw new Error('error fetching payment transaction');
    }

    // TODO: Clean this up
    if (paymentRecord.test == false) {
        const trmService = new TrmService();

        try {
            await trmService.screenAddress(body.account);
        } catch (error) {
            let rejectionReason: PaymentSessionStateRejectedReason = PaymentSessionStateRejectedReason.processingError;

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

            await websocketSession.sendErrorDetailsMessage({
                errorTitle: 'Could not process payment.',
                errorDetail:
                    'It looks like your wallet has been flagged for suspicious activity. We are not able to process your payment at this time. Please go back and try another method.',
                errorRedirect: paymentRecord.redirectUrl ?? paymentRecord.cancelURL,
            });

            // TODO: Better error response
            throw new Error('error fetching payment transaction');
        }
    }

    try {
        transaction = encodeTransaction(paymentTransaction.transaction);
    } catch (error) {
        console.log('error encoding transaction');
        throw new Error('error encoding transaction');
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
        throw new Error('transaction signature is null');
    }

    const signatureBuffer = transactionSignature;

    const signatureString = encodeBufferToBase58(signatureBuffer);

    await websocketSession.sendTransactionDeliveredMessage();

    try {
        await transactionRecordService.createTransactionRecord(
            signatureString,
            TransactionType.payment,
            paymentRecord.id,
            null
        );
    } catch (error) {
        console.log('error creating transaction record');
        throw new Error('error creating transaction record');
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
};

export interface CreateTransactionRecordServiceInterface<RecordType, RejectResponse> {
    getRecordFromId: (id: string) => Promise<RecordType | null>;
}

export class CreateTransactionUseCase
    implements
        HandlerCoreFunctionUseCaseInterface<
            {},
            TransactionRequestBody,
            TransactionRequestParameters,
            Promise<APIGatewayProxyResultV2>
        >
{
    constructor(
        private recordService: CreateTransactionRecordServiceInterface<ShopifyRecord, ShopifyRejectResponse>,
        private prisma: PrismaClient,
        private trm: TrmService,
        private axiosInstance: typeof axios
    ) {}

    private createTransaction = async (
        _: {},
        body: TransactionRequestBody,
        queryParameter: TransactionRequestParameters
    ): Promise<APIGatewayProxyResultV2> => {
        let record: ShopifyRecord | null;
        let merchant: Merchant | null;
        let transactionResponse: TransactionRequestResponse;
        let transaction: web3.Transaction;
        let gasKeypair: web3.Keypair;

        const merchantService = new MerchantService(this.prisma);
        const transactionRecordService = new TransactionRecordService(this.prisma);
        const websocketSessionService = new WebsocketSessionService(this.prisma);

        try {
            record = await this.recordService.getRecordFromId(queryParameter.id);
        } catch (error) {
            throw new Error('error fetching record');
        }

        if (record == null) {
            throw new Error('fetched record was null');
        }

        const websocketUrl = process.env.WEBSOCKET_URL;

        if (websocketUrl == null) {
            throw new MissingEnvError('websocket url');
        }

        const websocketSession = new WebSocketService(
            websocketUrl,
            {
                paymentRecordId: record.id,
            },
            websocketSessionService
        );

        await websocketSession.sendTransacationRequestStartedMessage();

        try {
            gasKeypair = await fetchGasKeypair();
        } catch (error) {
            throw new Error('error fetching gas keypair');
        }

        try {
            merchant = await merchantService.getMerchant({
                id: record.merchantId,
            });
        } catch (error) {
            throw new Error('error fetching merchant');
        }

        if (merchant == null) {
            throw new Error('merchant is null');
        }

        if (merchant.accessToken == null) {
            throw new Error('merchant access token is null');
        }

        const singleUseKeypair = await generateSingleUseKeypairFromRecord(record);

        try {
            await uploadSingleUseKeypair(singleUseKeypair, record);
        } catch (error) {
            console.log('could not upload single use keypair');
            // TODO: Log this error in sentry
            // TODO: Prob dont crash here, fail ez, nbd
        }

        try {
            transactionResponse = await fetchRecordTransaction(
                record,
                merchant,
                body.account,
                gasKeypair.publicKey.toBase58(),
                singleUseKeypair.publicKey.toBase58(),
                gasKeypair.publicKey.toBase58(),
                this.axiosInstance
            );
        } catch (error) {
            throw new Error('error fetching payment transaction');
        }

        if (record.test == false) {
            try {
                await this.trm.screenAddress(body.account);
            } catch (error) {
                // let rejectionReason: PaymentSessionStateRejectedReason =
                //     PaymentSessionStateRejectedReason.processingError;
                // if (error instanceof RiskyWalletError) {
                //     rejectionReason = PaymentSessionStateRejectedReason.risky;
                // }
                // const paymentSessionReject = makePaymentSessionReject(axios);
                // let paymentSessionData: { redirectUrl: string };
                // try {
                //     const paymentSessionRejectResponse = await paymentSessionReject(
                //         record.shopGid,
                //         rejectionReason,
                //         merchant.shop,
                //         merchant.accessToken
                //     );
                //     paymentSessionData = validatePaymentSessionRejected(paymentSessionRejectResponse);
                //     try {
                //         paymentRecord = await paymentRecordService.updatePaymentRecord(paymentRecord, {
                //             status: PaymentRecordStatus.rejected,
                //             redirectUrl: paymentSessionData.redirectUrl,
                //             completedAt: new Date(),
                //             rejectionReason: PaymentRecordRejectionReason.customerSafetyReason, // Todo, make this more dynamic once we have location
                //         });
                //     } catch (error) {
                //         // TODO: Handle the database update failing here
                //     }
                // } catch (error) {
                //     try {
                //         await sendPaymentRejectRetryMessage(paymentRecord.id, rejectionReason);
                //     } catch (error) {
                //         // TODO: This would be an odd error to hit, sending messages to the queue shouldn't fail. It will be good to log this
                //         // with sentry and figure out why it happened. Also good to figure out some kind of redundancy here. Also good to
                //         // build in a way to manually intervene here if needed.
                //     }
                // }
                // // TODO: What to do if this fails? If it fail's they're likely gonna go into the
                // // reconnect flow and we will let them know there.
                // await websocketSession.sendErrorDetailsMessage({
                //     errorTitle: 'Could not process payment.',
                //     errorDetail:
                //         'It looks like your wallet has been flagged for suspicious activity. We are not able to process your payment at this time. Please go back and try another method.',
                //     errorRedirect: paymentRecord.redirectUrl ?? paymentRecord.cancelURL,
                // });
                // // TODO: Better error response
                // throw new Error('error fetching payment transaction');
            }
        }

        try {
            transaction = encodeTransaction(transactionResponse.transaction);
        } catch (error) {
            throw new Error('error encoding transaction');
        }

        transaction.partialSign(gasKeypair);
        transaction.partialSign(singleUseKeypair);

        const transactionSignature = transaction.signature;

        if (transactionSignature == null) {
            console.log('transaction signature is null');
            throw new Error('transaction signature is null');
        }

        const signatureBuffer = transactionSignature;

        const signatureString = encodeBufferToBase58(signatureBuffer);

        await websocketSession.sendTransactionDeliveredMessage();

        try {
            await transactionRecordService.createTransactionRecord(
                signatureString,
                TransactionType.payment,
                record.id,
                null
            );
        } catch (error) {
            console.log('error creating transaction record');
            throw new Error('error creating transaction record');
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
                message: `Paying ${merchant.name} ${record.usdcAmount.toFixed(6)} USDC`,
            }),
        };
    };

    async coreFunction(
        header: {},
        body: TransactionRequestBody,
        queryParameter: TransactionRequestParameters
    ): Promise<APIGatewayProxyResultV2> {
        return await this.createTransaction(header, body, queryParameter);
    }
}

export const paymentTransactionTaskChain = (): HandlerTaskChain<
    {},
    TransactionRequestBody,
    TransactionRequestParameters,
    APIGatewayProxyResultV2,
    { prisma: PrismaClient; axiosInstance: typeof axios }
> => {
    const headerUseCase = new ParseAndValidateUseCase(() => ({}));
    const bodyUseCase = new ParseAndValidateUseCase((body: string) =>
        parseAndValidateTransactionRequestBody(JSON.parse(body))
    );
    const parameterUseCase = new ParseAndValidateUseCase(parseAndValidatePaymentTransactionRequest);
    const inputUseCase = new InputValidationUseCase(headerUseCase, bodyUseCase, parameterUseCase);

    const prisma = new PrismaClient();
    const trm = new TrmService();

    const paymentRecordService = new PaymentRecordService(prisma);

    const createTransactionUseCase = new CreateTransactionUseCase(paymentRecordService, prisma, trm, axios);

    const errorResponseUseCase = new ErrorResponseUseCase(createErrorResponse);
    const handlerErrorUseCase = new HandlerErrorUseCase(errorResponseUseCase);

    const taskChain = new HandlerTaskChain(inputUseCase, createTransactionUseCase, handlerErrorUseCase);
    return taskChain;
};
