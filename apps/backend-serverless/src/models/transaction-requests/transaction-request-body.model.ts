import { InferType, object } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility';
import { publicKeySchema } from '../public-key-schema.model';

export const transactionRequestBodySchema = object().shape({
    account: publicKeySchema.required(),
});

export type TransactionRequestBody = InferType<typeof transactionRequestBodySchema>;

export const parseAndValidateTransactionRequestBody = (transactionRequestBody: unknown): TransactionRequestBody => {
    return parseAndValidateStrict<TransactionRequestBody>(
        transactionRequestBody,
        transactionRequestBodySchema,
        'Could not parse the transaction request body. Unknown Reason.'
    );
};
