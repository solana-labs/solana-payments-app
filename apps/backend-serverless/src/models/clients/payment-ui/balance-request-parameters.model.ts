import { PublicKey } from '@solana/web3.js';
import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../../utilities/yup.utility.js';

export const balanceRequestParametersScheme = object().shape({
    pubkey: string()
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

export type BalanceRequestParameters = InferType<typeof balanceRequestParametersScheme>;

export const parseAndValidateBalanceParameters = (balanceRequestParameters: unknown): BalanceRequestParameters => {
    return parseAndValidateStrict(
        balanceRequestParameters,
        balanceRequestParametersScheme,
        'Can not parse balance parameters. Unkownn reason.'
    );
};
