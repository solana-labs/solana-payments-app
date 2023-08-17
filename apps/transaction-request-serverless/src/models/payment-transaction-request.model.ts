import { InferType, boolean, number, object, string } from 'yup';
import { parseAndValidate } from '../utilities/yup.utility.js';
import { publicKeySchema } from './public-key-schema.model.js';

export enum TransactionType {
    blockhash = 'blockhash',
    nonce = 'nonce',
}

export enum AmountType {
    size = 'size',
    quantity = 'quantity',
}

export const paymentTransactionRequestScheme = object().shape({
    receiverWalletAddress: string().optional(),
    receiverTokenAddress: string().optional(),
    sender: publicKeySchema.required(),
    receivingToken: publicKeySchema.required(),
    sendingToken: publicKeySchema.required(),
    feePayer: publicKeySchema.required(),
    receivingAmount: number().required(),
    amountType: string().oneOf(Object.values(AmountType), 'Invalid amount type.').default(AmountType.size).required(),
    transactionType: string()
        .oneOf(Object.values(TransactionType), 'Invalid transaction type')
        .default(TransactionType.blockhash)
        .required(),
    createAta: boolean().default(true).required(),
    singleUseNewAcc: publicKeySchema.nullable(), // public key for a system program create account instruction. useful to insure only a single payment transaction fetched from this server could ever be submitted on chain.
    singleUsePayer: publicKeySchema.nullable(), //wallet responsible for paying for the rent of the single use account
    indexInputs: string().nullable(), //comma seperated list of strings. public key is derived from the input and added onto an instruction. useful for finding payment transactions on chain later
});

export type PaymentTransactionRequest = InferType<typeof paymentTransactionRequestScheme>;

export const parseAndValidatePaymentTransactionRequest = (
    paymentTransactionRequestParams: unknown
): PaymentTransactionRequest => {
    return parseAndValidate(
        paymentTransactionRequestParams,
        paymentTransactionRequestScheme,
        'Invalid payment transaction request'
    );
};
