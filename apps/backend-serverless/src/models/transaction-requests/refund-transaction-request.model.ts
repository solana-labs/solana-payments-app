import { PublicKey } from '@solana/web3.js';
import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

export const refundTransactionRequestScheme = object().shape({
    refundId: string().required(),
    account: string()
        .required()
        .test('is-solana-pubkey', 'Invalid Solana Public Key', value => {
            try {
                new PublicKey(value);
                return true;
            } catch (error) {
                return false;
            }
        }),
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
