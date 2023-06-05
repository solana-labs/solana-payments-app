import { object, string, InferType } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';

export const refundTransactionRequestScheme = object().shape({
    refundId: string().required(),
});

export type RefundTransactionRequest = InferType<typeof refundTransactionRequestScheme>;

export const parseAndValidateRefundTransactionRequest = (
    refundTransactionRequestBody: unknown
): RefundTransactionRequest => {
    return parseAndValidate<RefundTransactionRequest>(
        refundTransactionRequestBody,
        refundTransactionRequestScheme,
        'Could not parse the refund transaction request body. Unknown Reason.'
    );
};
