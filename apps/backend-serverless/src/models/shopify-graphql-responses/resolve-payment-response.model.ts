import { object, string, InferType, array, mixed } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';
import { sharedPaymentResponseRootSchema, shopifyResponseExtensionsSchema } from './shared.model.js';

// The possible values that can be used to describe the next action that a Partner should do after a payment is finalized.
enum PaymentSessionNextActionAction {
    redirect = 'REDIRECT',
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

export const paymentSessionResolvePaymentSessionSchema = object().shape({
    id: string().required(),
    state: mixed()
        .oneOf([paymentSessionStatePendingSchema, paymentSessionStateRejectedSchema, paymentSessionStateResolvedSchema])
        .required(),
    nextAction: paymentSessionNextActionSchema.optional(),
});

export const paymentSessionResolveUserErrorsSchema = object().shape({
    field: array().of(string()).optional(), // The path to the input field that caused the error.
    message: string().optional(), // The error message.
});

export const dataPaymentSessionResolveSchema = object().shape({
    paymentSession: paymentSessionResolvePaymentSessionSchema.required(), // The updated payment session.
    userErrors: array().of(string()).required(), // The list of errors that occurred from executing the mutation.
});

export const paymentSessionResolveDataSchema = object().shape({
    paymentSessionResolve: dataPaymentSessionResolveSchema.required(),
});

export const paymentSessionResolveResponseSchema = object().shape({
    data: paymentSessionResolveDataSchema.required(),
    extensions: shopifyResponseExtensionsSchema.required(),
});

export type ResolvePaymentResponse = InferType<typeof paymentSessionResolveResponseSchema>;

export const parseAndValidateResolvePaymentResponse = (resolvePaymentResponeBody: any): ResolvePaymentResponse => {
    return parseAndValidate(
        resolvePaymentResponeBody,
        paymentSessionResolveResponseSchema,
        'Could not parse the resolve payment response. Unknown Reason.'
    );
};
