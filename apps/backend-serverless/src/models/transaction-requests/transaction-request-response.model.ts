import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility';

export const transactionRequestResponseScheme = object().shape({
    transaction: string().required(),
    message: string().optional(),
});

export type TransactionRequestResponse = InferType<typeof transactionRequestResponseScheme>;

export const parseAndValidateTransactionRequestResponse = (
    transactionRequestResponseBody: unknown
): TransactionRequestResponse => {
    return parseAndValidateStrict<TransactionRequestResponse>(
        transactionRequestResponseBody,
        transactionRequestResponseScheme,
        'Could not parse the transaction request response. Unknown Reason.'
    );
};
