import { InferType, object } from 'yup';
import { parseAndValidateStrict } from '../../../utilities/yup.utility.js';
import { publicKeySchema } from '../../public-key-schema.model.js';

export const balanceRequestParametersScheme = object().shape({
    publicKey: publicKeySchema.required(),
    mint: publicKeySchema.required(),
});

export type BalanceRequestParameters = InferType<typeof balanceRequestParametersScheme>;

export const parseAndValidateBalanceParameters = (balanceRequestParameters: unknown): BalanceRequestParameters => {
    return parseAndValidateStrict(
        balanceRequestParameters,
        balanceRequestParametersScheme,
        'Can not parse balance parameters. Unknown reason.'
    );
};
