import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

export const transactionRequestBodySchema = object().shape({
    account: string().required(),
});

export type TransactionRequestBody = InferType<typeof transactionRequestBodySchema>;

export const parseAndValidateTransactionRequestBody = (transactionRequestBody: unknown): TransactionRequestBody => {
    return parseAndValidateStrict<TransactionRequestBody>(
        transactionRequestBody,
        transactionRequestBodySchema,
        'Could not parse the transaction request body. Unknown Reason.',
    );
};
