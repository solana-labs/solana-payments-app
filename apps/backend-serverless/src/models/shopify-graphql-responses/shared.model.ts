import { object, string, array, mixed, number } from 'yup';

enum RefundSessionResolveUserErrorCode {
    invalidState = 'REFUND_SESSION_INVALID_STATE',
    notFound = 'REFUND_SESSION_NOT_FOUND',
}

// The possible values that can be used to describe the state of a finalized refund transaction.
enum RefundSessionStateCode {
    rejected = 'REJECTED',
    resolved = 'RESOLVED',
}

// The possible values that can be used to describe the reason why the refund is rejected.
enum RefundSessionStateRejectedReason {
    processingError = 'PROCESSING_ERROR',
}

// The possible values that can be used to describe the state of a payment transaction.
enum PaymentSessionStateCode {
    pending = 'PENDING',
    rejected = 'REJECTED',
    resolved = 'RESOLVED',
}

// The possible values that can be used to describe the reasons why a payment is rejected.
enum PaymentSessionStateRejectedReason {
    processingError = 'PROCESSING_ERROR',
    risky = 'RISKY',
}

// Reasons the finalization of the payment is pending.
enum PaymentSessionStatePendingReason {
    buyerActionRequired = 'BUYER_ACTION_REQUIRED', // Awaiting action from the buyer.
    networkActionRequired = 'NETWORK_ACTION_REQUIRED', // Awaiting action from the network.
    partnerActionRequired = 'PARTNER_ACTION_REQUIRED', // Awaiting action from the Partner.
}

export const shopifyResponseExtensionsThrottleStatusSchema = object().shape({
    maximumAvailable: number().optional(),
    currentlyAvailable: number().optional(),
    restoreRate: number().optional(),
});

export const shopifyResponseExtensionsCostSchema = object().shape({
    requestedQueryCost: number().optional(),
    actualQueryCost: number().optional(),
    throttleStatus: shopifyResponseExtensionsThrottleStatusSchema.optional(),
});

export const shopifyResponseExtensionsSchema = object().shape({
    cost: shopifyResponseExtensionsCostSchema.optional(),
});

export const refundSessionStateRejectedSchema = object().shape({
    code: string().oneOf(Object.values(RefundSessionStateCode)).optional(), // The error code.
    merchantMessage: string().optional(), // The custom, localized message for the merchant.
    reason: string().oneOf(Object.values(RefundSessionStateRejectedReason)).optional(), // The reason the refund is rejected.
});

export const refundSessionStateResolvedSchema = object().shape({
    code: string().oneOf(Object.values(RefundSessionStateCode)).optional(), // The refund state code.
});

export const refundSessionSchema = object().shape({
    id: string().required(), // A globally-unique ID.
    state: mixed().oneOf([refundSessionStateRejectedSchema, refundSessionStateResolvedSchema]).required(), // Details about the refund state.
});

export const refundSessionResolveUserErrorSchema = object().shape({
    code: string().oneOf(Object.values(RefundSessionResolveUserErrorCode)).optional(), // The error code.
    field: array().of(string()).optional(), // The path to the input field that caused the error.
    message: string().required(), // The error message.
});

export const sharedRefundResponseRootSchema = object().shape({
    refundSession: refundSessionSchema.required(), // The updated refund session.
    userErrors: array().of(refundSessionResolveUserErrorSchema).required(), // The list of errors that occurred from executing the mutation.
});

// The possible values that can be used to describe the next action that a Partner should do after a payment is finalized.
enum PaymentSessionNextActionAction {
    redirect = 'REDIRECT',
}

export const paymentSessionStatePendingSchema = object().shape({
    code: string().oneOf(Object.values(PaymentSessionStateCode)).required(), // The payment state code.
    reson: string().oneOf(Object.values(PaymentSessionStatePendingReason)).optional(), // The reason the payment is pending.
});

export const paymentSessionStateRejectedSchema = object().shape({
    code: string().oneOf(Object.values(PaymentSessionStateCode)).required(), // The payment state code.
    merchantMessage: string().optional(), // The custom, localized message for the merchant.
    reson: string().oneOf(Object.values(PaymentSessionStateRejectedReason)).required(), // The reason the payment is rejected.
});

export const paymentSessionStateResolvedSchema = object().shape({
    code: string().oneOf(Object.values(PaymentSessionStateCode)).required(), // The payment state code.
});

export const nextActionContextSchema = object().shape({
    redirectUrl: string().required(),
});

export const paymentSessionNextActionSchema = object().shape({
    action: string().oneOf(Object.values(PaymentSessionNextActionAction)).required(),
    context: nextActionContextSchema.required(),
});

export const paymentSessionSchema = object().shape({
    id: string().required(),
    state: mixed()
        .oneOf([paymentSessionStatePendingSchema, paymentSessionStateRejectedSchema, paymentSessionStateResolvedSchema])
        .required(),
    nextAction: paymentSessionNextActionSchema.optional(),
});

export const userErrorsSchema = object().shape({
    field: array().of(string()).optional(), // The path to the input field that caused the error.
    message: string().optional(), // The error message.
});

export const sharedPaymentSessionSchema = object().shape({
    paymentSession: paymentSessionSchema.required(), // The updated payment session.
    userErrors: userErrorsSchema.required(), // The list of errors that occurred from executing the mutation.
});
