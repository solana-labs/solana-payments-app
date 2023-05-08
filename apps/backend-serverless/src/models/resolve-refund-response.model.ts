import { object, string, InferType, array } from 'yup'
import { parseAndValidate } from '../utilities/yup.utility.js'

// export const resolvePaymentResponseThrottleStatusSchema = object().shape({
//     maximumAvailable: string().optional(),
//     currentlyAvailable: string().optional(),
//     restoreRate: string().optional(),
// })

// export const resolvePaymentResponseCostSchema = object().shape({
//     requestedQueryCost: string().optional(),
//     actualQueryCost: string().optional(),
//     throttleStatus: resolvePaymentResponseThrottleStatusSchema.optional(),
// })

export const resolveRefundResponseStateSchema = object().shape({
    code: string().required(),
})

// export const resolvePaymentResponseContextSchema = object().shape({
//     redirectUrl: string().required(),
// })

// export const resolveRefundResponseNextActionSchema = object().shape({
//     action: string().required(),
//     context: resolvePaymentResponseContextSchema.optional(),
// })

export const resolveRefundResponseRefundSessionSchema = object().shape({
    id: string().required(),
    state: resolveRefundResponseStateSchema.optional(),
})

// export const resolvePaymentResponseExtensionsSchema = object().shape({
//     cost: resolvePaymentResponseCostSchema.required(),
// })

export const resolveRefundResponseRefundSessionResolveSchema = object().shape({
    refundSession: resolveRefundResponseRefundSessionSchema.required(),
    userErrors: array().of(string()).required(),
})

export const resolveRefundResponseDataSchema = object().shape({
    refundSessionResolve:
        resolveRefundResponseRefundSessionResolveSchema.required(),
})

export const resolveRefundResponseSchema = object().shape({
    data: resolveRefundResponseDataSchema.required(),
})

export type ResolveRefundResponse = InferType<
    typeof resolveRefundResponseSchema
>

export const parseAndValidateResolveRefundResponse = (
    resolveRefundResponeBody: any
): ResolveRefundResponse => {
    return parseAndValidate<ResolveRefundResponse>(
        resolveRefundResponeBody,
        resolveRefundResponseSchema,
        'Could not parse the resolve refund response body. Unknown Reason.'
    )
}
