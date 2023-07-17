import * as web3 from '@solana/web3.js';
import { InferType, boolean, number, object, string } from 'yup';
import { parseAndValidate } from '../utilities/yup.utility.js';

const publicKeySchema = string()
    .required()
    .test('is-public-key', 'Invalid public key', value => {
        try {
            if (value === undefined || value === null) {
                return false;
            }
            new web3.PublicKey(value);
            return true;
        } catch (err) {
            return false;
        }
    });

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
    singleUseNewAcc: publicKeySchema.nullable(),
    singleUsePayer: publicKeySchema.nullable(),
    indexInputs: string().nullable(),
});

export type PaymentTransactionRequest = InferType<typeof paymentTransactionRequestScheme>;

export const parseAndValidatePaymentTransactionRequest = (
    paymentTransactionRequestParams: unknown,
): PaymentTransactionRequest => {
    return parseAndValidate(
        paymentTransactionRequestParams,
        paymentTransactionRequestScheme,
        'Invalid payment transaction request',
    );
};
