import { InferType, object } from 'yup';
import { parseAndValidateStrict } from '../../../utilities/yup.utility';
import { publicKeySchema } from '../../public-key-schema.model';

export const balanceRequestParametersScheme = object().shape({
    publicKey: publicKeySchema.required(),
    mint: publicKeySchema.required(),
});

export type BalanceRequestParameters = InferType<typeof balanceRequestParametersScheme>;

export const parseAndValidateBalanceParameters = (balanceRequestParameters: unknown): BalanceRequestParameters => {
    return parseAndValidateStrict(
        balanceRequestParameters,
        balanceRequestParametersScheme,
        'Can not parse balance parameters. Unkownn reason.'
    );
};
