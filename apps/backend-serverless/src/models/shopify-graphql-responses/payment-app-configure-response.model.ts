import { object, string, InferType, array } from 'yup'
import { parseAndValidate } from '../../utilities/yup.utility.js'
import { shopifyResponseExtensionsSchema } from './shared.model.js'

export const resolvePaymentResponseStateSchema = object().shape({
    code: string().required(),
})

export const resolvePaymentResponseContextSchema = object().shape({
    redirectUrl: string().required(),
})

export const resolvePaymentResponseNextActionSchema = object().shape({
    action: string().required(),
    context: resolvePaymentResponseContextSchema.optional(),
})

export const resolvePaymentResponsePaymentSessionSchema = object().shape({
    id: string().required(),
    state: resolvePaymentResponseStateSchema.optional(),
    nextAction: resolvePaymentResponseNextActionSchema.optional(),
})

export const resolvePaymentResponsePaymentSessionResolveSchema = object().shape(
    {
        paymentSession: resolvePaymentResponsePaymentSessionSchema.required(),
        userErrors: array().of(string()).required(),
    }
)

export const resolvePaymentResponseDataSchema = object().shape({
    paymentSessionResolve:
        resolvePaymentResponsePaymentSessionResolveSchema.required(),
})

export const paymentAppConfigureResponseSchema = object().shape({
    data: resolvePaymentResponseDataSchema.required(),
    extensions: shopifyResponseExtensionsSchema.required(),
})

export type ResolvePaymentResponse = InferType<
    typeof paymentAppConfigureResponseSchema
>

export const parseAndValidatePaymentAppConfigureResponse = (
    paymentAppConfigureResponeBody: any
): ResolvePaymentResponse => {
    return parseAndValidate(
        paymentAppConfigureResponeBody,
        paymentAppConfigureResponseSchema,
        'Could not parse the payment app configure response. Unknown Reason.'
    )
}
