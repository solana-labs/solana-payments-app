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

export const rejectRefundResponseStateSchema = object().shape({
    code: string().required(),
    reason: string().required(),
    merchantMessage: string().required(),
})

// export const resolvePaymentResponseContextSchema = object().shape({
//     redirectUrl: string().required(),
// })

// export const resolveRefundResponseNextActionSchema = object().shape({
//     action: string().required(),
//     context: resolvePaymentResponseContextSchema.optional(),
// })

export const rejectRefundResponseRefundSessionSchema = object().shape({
    id: string().required(),
    state: rejectRefundResponseStateSchema.optional(),
})

// export const resolvePaymentResponseExtensionsSchema = object().shape({
//     cost: resolvePaymentResponseCostSchema.required(),
// })

export const resolveRefundResponseRefundSessionResolveSchema = object().shape({
    refundSession: rejectRefundResponseRefundSessionSchema.required(),
    userErrors: array().of(string()).required(),
})

export const rejectRefundResponseDataSchema = object().shape({
    refundSessionReject:
        resolveRefundResponseRefundSessionResolveSchema.required(),
})

export const rejectRefundResponseSchema = object().shape({
    data: rejectRefundResponseDataSchema.required(),
})

export type RejectRefundResponse = InferType<typeof rejectRefundResponseSchema>

export const parseAndValidateRejectRefundResponse = (
    rejectRefundResponeBody: any
): RejectRefundResponse => {
    return parseAndValidate<RejectRefundResponse>(
        rejectRefundResponeBody,
        rejectRefundResponseSchema,
        'Could not parse the reject refund response body. Unknown Reason.'
    )
}
