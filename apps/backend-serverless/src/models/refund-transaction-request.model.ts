import { object, string, InferType, boolean, number } from 'yup'
import { parseAndValidate } from '../utilities/yup.utility.js'

export const refundTransactionRequestScheme = object().shape({
    refundId: number().required(),
})

export type RefundTransactionRequest = InferType<
    typeof refundTransactionRequestScheme
>

export const parseAndValidateRefundTransactionRequest = (
    refundTransactionRequestBody: any
): RefundTransactionRequest => {
    return parseAndValidate<RefundTransactionRequest>(
        refundTransactionRequestBody,
        refundTransactionRequestScheme,
        'Could not parse the refund transaction request body. Unknown Reason.'
    )
}
