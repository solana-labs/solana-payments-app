import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility';

export const refundTransactionRequestScheme = object().shape({
    refundId: string().required(),
});

export type RefundTransactionRequest = InferType<typeof refundTransactionRequestScheme>;

export const parseAndValidateRefundTransactionRequest = (
    refundTransactionRequestBody: unknown
): RefundTransactionRequest => {
    return parseAndValidateStrict<RefundTransactionRequest>(
        refundTransactionRequestBody,
        refundTransactionRequestScheme,
        'Could not parse the refund transaction request body. Unknown Reason.'
    );
};
