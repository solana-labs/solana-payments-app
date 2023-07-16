import { InferType, boolean, number, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';
import {
    PaymentSessionStateRejectedReason,
    RefundSessionStateRejectedReason,
} from '../shopify-graphql-responses/shared.model.js';
export enum ShopifyMutationRetryType {
    paymentResolve = 'payment-resolve',
    paymentReject = 'payment-reject',
    refundResolve = 'refund-resolve',
    refundReject = 'refund-reject',
    appConfigure = 'app-configure',
}

export const shopifyMutationAppConfigureSchema = object().shape({
    merchantId: string().required(),
    state: boolean().required(),
});

export const shopifyMutationRefundRejectSchema = object().shape({
    refundId: string().required(),
    code: string().oneOf(Object.values(RefundSessionStateRejectedReason)).required(),
    merchantMessage: string().optional(),
});

export const shopifyMutationRefundResolveSchema = object().shape({
    refundId: string().required(),
});

export const shopifyMutationPaymentRejectSchema = object().shape({
    paymentId: string().required(),
    reason: string().oneOf(Object.values(PaymentSessionStateRejectedReason)).required(),
});

export const shopifyMutationPaymentResolveSchema = object().shape({
    paymentId: string().required(),
});

export const shopifyMutationRetrySchema = object().shape({
    retryType: string().oneOf(Object.values(ShopifyMutationRetryType)).required(),
    retryStepIndex: number().required(),
    retrySeconds: number().required(),
    paymentResolve: shopifyMutationPaymentResolveSchema.nullable(),
    paymentReject: shopifyMutationPaymentRejectSchema.nullable(),
    refundResolve: shopifyMutationRefundResolveSchema.nullable(),
    refundReject: shopifyMutationRefundRejectSchema.nullable(),
    appConfigure: shopifyMutationAppConfigureSchema.nullable(),
});

export type ShopifyMutationAppConfigure = InferType<typeof shopifyMutationAppConfigureSchema>;

export type ShopifyMutationRefundReject = InferType<typeof shopifyMutationRefundRejectSchema>;

export type ShopifyMutationRefundResolve = InferType<typeof shopifyMutationRefundResolveSchema>;

export type ShopifyMutationPaymentReject = InferType<typeof shopifyMutationPaymentRejectSchema>;

export type ShopifyMutationPaymentResolve = InferType<typeof shopifyMutationPaymentResolveSchema>;

export type ShopifyMutationRetry = InferType<typeof shopifyMutationRetrySchema>;

export const parseAndValidateShopifyMutationRetry = (shopifyMutationRetryBody: unknown): ShopifyMutationRetry => {
    return parseAndValidateStrict(
        shopifyMutationRetryBody,
        shopifyMutationRetrySchema,
        'Could not parse the shopify mutation retry body. Unknown Reason.',
    );
};
