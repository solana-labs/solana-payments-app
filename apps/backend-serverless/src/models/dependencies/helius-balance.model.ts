import { InferType, array, number, object } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';
import { publicKeySchema } from '../public-key-schema.model.js';

export const heliusTokenSchema = object().shape({
    mint: publicKeySchema.required(),
    amount: number().required(),
    decimals: number().required(),
    tokenAccount: publicKeySchema.required(),
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
