import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../utilities/yup.utility.js';

export const transactionRequestSchema = object().shape({
    account: string().required(),
});

export type TransactionRequestBody = InferType<typeof transactionRequestSchema>;

export const parseAndValidateTransactionRequestBody = (transactionRequestBody: unknown): TransactionRequestBody => {
    return parseAndValidateStrict<TransactionRequestBody>(
        transactionRequestBody,
        transactionRequestSchema,
        'Could not parse the transaction request body. Unknown Reason.',
    );
};
