import { object, string, InferType, array } from 'yup'
import { parseAndValidate } from '../../utilities/yup.utility.js'
import {
    sharedRefundResponseRootSchema,
    shopifyResponseExtensionsSchema,
} from './shared.model.js'

export const rejectRefundResponseDataSchema = object().shape({
    refundSessionReject: sharedRefundResponseRootSchema.required(),
})

export const rejectRefundResponseSchema = object().shape({
    data: rejectRefundResponseDataSchema.required(),
    extensions: shopifyResponseExtensionsSchema.required(),
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
