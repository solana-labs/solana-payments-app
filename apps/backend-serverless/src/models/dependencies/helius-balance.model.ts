import { PublicKey } from '@solana/web3.js';
import { InferType, array, number, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

export const heliusTokenSchema = object().shape({
    mint: string()
        .required()
        .test('is-solana-mint', 'Invalid Solana Mint', value => {
            try {
                new PublicKey(value);
                return true;
            } catch (error) {
                return false;
            }
        }),
    amount: number().required(),
    decimals: number().required(),
    tokenAccount: string()
        .required()
        .test('is-solana-token-account', 'Invalid Solana token account', value => {
            try {
                new PublicKey(value);
                return true;
            } catch (error) {
                return false;
            }
        }),
});

export const heliusBalanceSchema = object().shape({
    tokens: array().of(heliusTokenSchema).required(),
    nativeBalance: number().required(),
});

export type HeliusBalance = InferType<typeof heliusBalanceSchema>;

export const parseAndValidateHeliusBalance = (heliusBalanceResponse: unknown): HeliusBalance => {
    return parseAndValidateStrict(
        heliusBalanceResponse,
        heliusBalanceSchema,
        'Could not parse the heluis balance response. Unknown Reason.'
    );
};
