import { object, string, InferType, boolean, number } from 'yup'
import { parseAndValidate } from '../utilities/yup.utility.js'

export const rejectRefundRequestBodySchema = object().shape({
    refundId: number().required(),
    merchantReason: string().required(),
})

export type RejectRefundRequest = InferType<
    typeof rejectRefundRequestBodySchema
>

export const parseAndValidateRejectRefundRequest = (
    rejectRefundRequestBody: any
): RejectRefundRequest => {
    return parseAndValidate(
        rejectRefundRequestBody,
        rejectRefundRequestBodySchema,
        'Could not parse the reject refund request. Unknown Reason.'
    )
}
