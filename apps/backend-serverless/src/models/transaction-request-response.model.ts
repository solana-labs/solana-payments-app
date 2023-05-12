import { object, string, InferType } from 'yup';
import { parseAndValidate } from '../utilities/yup.utility.js';

export const transactionRequestResponseScheme = object().shape({
    transaction: string().required(),
    message: string().optional(),
});

export type TransactionRequestResponse = InferType<typeof transactionRequestResponseScheme>;

export const parseAndValidateTransactionRequestResponse = (
    transactionRequestResponseBody: any
): TransactionRequestResponse => {
    return parseAndValidate<TransactionRequestResponse>(
        transactionRequestResponseBody,
        transactionRequestResponseScheme,
        'Could not parse the transaction request response. Unknown Reason.'
    );
};
