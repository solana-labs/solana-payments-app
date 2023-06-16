import pkg from 'aws-sdk';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import {
    ShopifyMutationAppConfigure,
    ShopifyMutationPaymentReject,
    ShopifyMutationPaymentResolve,
    ShopifyMutationRefundReject,
    ShopifyMutationRefundResolve,
    ShopifyMutationRetryType,
} from '../../models/sqs/shopify-mutation-retry.model.js';
import { nextRetryTimeInterval, retry } from '../../utilities/shopify-retry/shopify-retry.utility.js';
import {
    PaymentSessionStateRejectedReason,
    RefundSessionStateRejectedReason,
} from '../../models/shopify-graphql-responses/shared.model.js';
const { SQS } = pkg;

/*
    NOTE: If you call any of these methods, you will need to add the iam role sqs:SendMessage
    to the lambda inside of the serverless.yml file
*/

export const sendPaymentResolveRetryMessage = async (paymentId: string) => {
    await sendRetryMessage(
        ShopifyMutationRetryType.paymentResolve,
        {
            paymentId: paymentId,
        },
        null,
        null,
        null,
        null
    );
};

export const sendPaymentRejectRetryMessage = async (paymentId: string, reason: PaymentSessionStateRejectedReason) => {
    await sendRetryMessage(
        ShopifyMutationRetryType.paymentReject,
        null,
        {
            paymentId: paymentId,
            reason: reason,
        },
        null,
        null,
        null
    );
};

export const sendRefundResolveRetryMessage = async (refundId: string) => {
    await sendRetryMessage(
        ShopifyMutationRetryType.refundResolve,
        null,
        null,
        {
            refundId: refundId,
        },
        null,
        null
    );
};

export const sendRefundRejectRetryMessage = async (
    refundId: string,
    code: RefundSessionStateRejectedReason,
    reason: string | undefined
) => {
    await sendRetryMessage(
        ShopifyMutationRetryType.refundReject,
        null,
        null,
        null,
        {
            refundId: refundId,
            code: code,
            merchantMessage: reason,
        },
        null
    );
};

export const sendAppConfigureRetryMessage = async (merchantId: string, state: boolean) => {
    await sendRetryMessage(ShopifyMutationRetryType.refundReject, null, null, null, null, {
        merchantId: merchantId,
        state: state,
    });
};

export const sendRetryMessage = async (
    retryType: ShopifyMutationRetryType,
    paymentResolve: ShopifyMutationPaymentResolve | null,
    paymentReject: ShopifyMutationPaymentReject | null,
    refundResolve: ShopifyMutationRefundResolve | null,
    refundReject: ShopifyMutationRefundReject | null,
    appConfigure: ShopifyMutationAppConfigure | null,
    retryStepIndex = 0,
    sqs: pkg.SQS = new SQS()
) => {
    const queueUrl = process.env.SHOPIFY_SQS_URL;

    if (queueUrl == null) {
        throw new MissingEnvError('aws shopify mutation queue url');
    }

    const retryTimeInterval = nextRetryTimeInterval(retryStepIndex);

    const maxNumberOfSendMessageAttempts = 3;

    const attempts = await retry(() => {
        return sqs
            .sendMessage({
                QueueUrl: queueUrl,
                MessageBody: JSON.stringify({
                    paymentResolve: paymentResolve,
                    paymentReject: paymentReject,
                    refundResolve: refundResolve,
                    refundReject: refundReject,
                    appConfigure: appConfigure,
                    retryType: retryType,
                    retryStepIndex: retryStepIndex,
                    retrySeconds: retryTimeInterval,
                }),
                MessageAttributes: {
                    'message-type': {
                        DataType: 'String',
                        StringValue: 'shopify-mutation-retry',
                    },
                },
            })
            .promise();
    }, maxNumberOfSendMessageAttempts);

    if (attempts === maxNumberOfSendMessageAttempts) {
        // TODO: Log in sentry as critical error
        throw new Error('Could not send SQS message');
    }
};

export const sendProcessTransactionMessage = async (signature: string, sqs: pkg.SQS = new SQS()) => {
    const queueUrl = process.env.PROCESS_SQS_URL;

    if (queueUrl == null) {
        throw new MissingEnvError('process queue url');
    }

    console.log(queueUrl);

    const maxNumberOfSendMessageAttempts = 3;

    const attempts = await retry(() => {
        return sqs
            .sendMessage({
                QueueUrl: queueUrl,
                MessageBody: JSON.stringify({
                    signature: signature,
                }),
            })
            .promise();
    }, maxNumberOfSendMessageAttempts);

    if (attempts === maxNumberOfSendMessageAttempts) {
        // TODO: Log in sentry as critical error
        throw new Error('Could not send SQS message');
    }
};

export const sendSolanaPayInfoMessage = async (account: string, paymentRecordId: string, sqs: pkg.SQS = new SQS()) => {
    const queueUrl = process.env.SP_INFO_SQS_URL;

    if (queueUrl == null) {
        throw new MissingEnvError('solana pay queue url');
    }

    console.log(queueUrl);

    const maxNumberOfSendMessageAttempts = 3;

    const attempts = await retry(() => {
        return sqs
            .sendMessage({
                QueueUrl: queueUrl,
                MessageBody: JSON.stringify({
                    account: account,
                    paymentRecordId: paymentRecordId,
                }),
            })
            .promise();
    }, maxNumberOfSendMessageAttempts);

    if (attempts === maxNumberOfSendMessageAttempts) {
        // TODO: Log in sentry as critical error
        throw new Error('Could not send SQS message');
    }
};
