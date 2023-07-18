import { InferType, object } from 'yup';
import { parseAndValidateStrict } from '../../../utilities/yup.utility.js';
import { publicKeySchema } from '../../public-key-schema.model.js';

export const balanceRequestParametersScheme = object().shape({
    pubkey: publicKeySchema.required(),
});

export type BalanceRequestParameters = InferType<typeof balanceRequestParametersScheme>;

export const parseAndValidateBalanceParameters = (balanceRequestParameters: unknown): BalanceRequestParameters => {
    return parseAndValidateStrict(
        balanceRequestParameters,
        balanceRequestParametersScheme,
        'Can not parse balance parameters. Unkownn reason.'
    );
};
