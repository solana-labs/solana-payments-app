import { object, string, InferType, array, boolean } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';
import { shopifyResponseExtensionsSchema } from './shared.model.js';

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
