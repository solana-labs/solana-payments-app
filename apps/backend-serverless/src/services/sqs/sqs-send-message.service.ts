import pkg from 'aws-sdk';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { PaymentRecord } from '@prisma/client';
import {
    ShopifyMutationAppConfigure,
    ShopifyMutationPaymentReject,
    ShopifyMutationPaymentResolve,
    ShopifyMutationRefundReject,
    ShopifyMutationRefundResolve,
    ShopifyMutationRetryType,
} from '../../models/shopify-mutation-retry.model.js';
import { nextRetryTimeInterval } from '../../utilities/shopify-retry/shopify-retry.utility.js';
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

export const sendPaymentRejectRetryMessage = async (paymentId: string, reason: string) => {
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

export const sendRefundRejectRetryMessage = async (refundId: string, code: string, reason: string) => {
    await sendRetryMessage(
        ShopifyMutationRetryType.refundReject,
        null,
        null,
        null,
        {
            refundId: refundId,
            code: code,
            reason: reason,
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
    retryStepIndex: number = 0
) => {
    const queueUrl = process.env.AWS_SHOPIFY_MUTATION_QUEUE_URL;

    if (queueUrl == null) {
        throw new MissingEnvError('aws shopify mutation queue url');
    }

    const sqs = new SQS();

    const retryTimeInterval = nextRetryTimeInterval(retryStepIndex);

    await sqs
        .sendMessage({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify({
                retryType: retryType,
                retryStepIndex: retryStepIndex,
                retrySeconds: retryTimeInterval,
                paymentResolve: paymentResolve,
                paymentReject: paymentReject,
                refundResolve: refundResolve,
                refundReject: refundReject,
                appConfigure: appConfigure,
            }),
            MessageAttributes: {
                'message-type': {
                    DataType: 'String',
                    StringValue: 'shopify-mutation-retry',
                },
            },
        })
        .promise();
};
