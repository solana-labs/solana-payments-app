import { object, InferType, string } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';

export const transactionRequestParametersScheme = object().shape({
    id: string().required(),
});

export type TransactionRequestParameters = InferType<typeof transactionRequestParametersScheme>;

export const parseAndValidatePaymentTransactionRequest = (
    transactionRequestParamters: unknown
): TransactionRequestParameters => {
    return parseAndValidate(
        transactionRequestParamters,
        transactionRequestParametersScheme,
        'Can not parse transaction request parameters. Unkownn reason.'
    );
};
