import { object, string, InferType, array, boolean } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';
import { shopifyResponseExtensionsSchema, userErrorsSchema } from './shared.model.js';

export const paymentsAppConfigurationSchema = object().shape({
    externalHandle: string().optional(),
    ready: boolean().required(),
});

export const paymentsAppConfigureSchema = object().shape({
    paymentsAppConfiguration: paymentsAppConfigurationSchema.nullable(),
    userErrors: array().of(userErrorsSchema).required(),
});

export const dataPaymentAppConfigureResponseSchema = object().shape({
    paymentsAppConfigure: paymentsAppConfigureSchema.required(),
});

export const paymentAppConfigureResponseSchema = object().shape({
    data: dataPaymentAppConfigureResponseSchema.required(),
    extensions: shopifyResponseExtensionsSchema.required(),
});

export type PaymentAppConfigureResponse = InferType<typeof paymentAppConfigureResponseSchema>;

export const parseAndValidatePaymentAppConfigureResponse = (
    paymentAppConfigureResponeBody: unknown
): PaymentAppConfigureResponse => {
    return parseAndValidate(
        paymentAppConfigureResponeBody,
        paymentAppConfigureResponseSchema,
        'Could not parse the payment app configure response. Unknown Reason.'
    );
};
