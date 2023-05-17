import { object, string, InferType, array, boolean } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';
import { shopifyResponseExtensionsSchema } from './shared.model.js';

// export const resolvePaymentResponseStateSchema = object().shape({
//     code: string().required(),
// });

// export const resolvePaymentResponseContextSchema = object().shape({
//     redirectUrl: string().required(),
// });

// export const resolvePaymentResponseNextActionSchema = object().shape({
//     action: string().required(),
//     context: resolvePaymentResponseContextSchema.optional(),
// });

export const paymentsAppConfigureResponsePaymentsAppConfigurationSchema = object().shape({
    externalHandle: string().required(),
    ready: boolean().required(),
});

export const paymentsAppConfigureResponsePaymentsAppConfigureSchema = object().shape({
    paymentsAppConfiguration: paymentsAppConfigureResponsePaymentsAppConfigurationSchema.required(),
    userErrors: array().of(string()).required(),
});

export const paymentAppConfigureResponseDataSchema = object().shape({
    paymentsAppConfigure: paymentsAppConfigureResponsePaymentsAppConfigureSchema.required(),
});

export const paymentAppConfigureResponseSchema = object().shape({
    data: paymentAppConfigureResponseDataSchema.required(),
    extensions: shopifyResponseExtensionsSchema.required(),
});

export type PaymentAppConfigureResponse = InferType<typeof paymentAppConfigureResponseSchema>;

export const parseAndValidatePaymentAppConfigureResponse = (
    paymentAppConfigureResponeBody: any
): PaymentAppConfigureResponse => {
    return parseAndValidate(
        paymentAppConfigureResponeBody,
        paymentAppConfigureResponseSchema,
        'Could not parse the payment app configure response. Unknown Reason.'
    );
};
