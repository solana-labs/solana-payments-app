import { InferType, array, number, object, string } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';

export const heliusTokenSchema = object().shape({
    mint: string().required(),
    amount: number().required(),
    decimals: number().required(),
    tokenAccount: string().required(),
});

export const heliusBalanceSchema = object().shape({
    tokens: array().of(heliusTokenSchema).required(),
    nativeBalance: number().required(),
});

export type HeliusBalance = InferType<typeof heliusBalanceSchema>;

export const parseAndValidateHeliusBalance = (heliusBalanceResponse: unknown): HeliusBalance => {
    return parseAndValidate(
        heliusBalanceResponse,
        heliusBalanceSchema,
        'Could not parse the heluis balance response. Unknown Reason.'
    );
};
