import { object, string, InferType } from 'yup';
import { parseAndValidate } from '../../../utilities/yup.utility.js';

export const balanceRequestParametersScheme = object().shape({
    pubkey: string().required(),
});

export type BalanceRequestParameters = InferType<typeof balanceRequestParametersScheme>;

export const parseAndValidateBalanceParameters = (balanceRequestParameters: unknown): BalanceRequestParameters => {
    return parseAndValidate(
        balanceRequestParameters,
        balanceRequestParametersScheme,
        'Can not parse balance parameters. Unkownn reason.'
    );
};
