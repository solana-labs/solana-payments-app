import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

export const transactionRequestBodyScheme = object().shape({
    account: string().required(),
});

export type TransactionRequestBody = InferType<typeof transactionRequestBodyScheme>;

export const parseAndValidateTransactionRequestBody = (transactionRequestBody: unknown): TransactionRequestBody => {
    return parseAndValidateStrict<TransactionRequestBody>(
        transactionRequestBody,
        transactionRequestBodyScheme,
        'Could not parse the transaction request body. Unknown Reason.'
    );
};
