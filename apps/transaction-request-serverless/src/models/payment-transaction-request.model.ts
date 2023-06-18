import { object, string, InferType, boolean, number } from 'yup';
import { parseAndValidate } from '../utils/yup.util.js';
import * as web3 from '@solana/web3.js';
import { TokenInformation } from '../configs/token-list.config.js';
import { createSwapIx } from '../services/swaps/create-swap-ix.service.js';
import { createTransferIx } from '../services/builders/transfer-ix.builder.js';
import { USDC_PUBKEY } from '../configs/pubkeys.config.js';
import { createAccountIx } from '../services/builders/create-account-ix.builder.js';
import { createIndexingIx } from '../services/builders/create-index-ix.builder.js';

const optionalPublicKeySchema = string().test('is-public-key', 'Invalid public key', value => {
    if (value === undefined || value === null) {
        return true;
    }

    try {
        new web3.PublicKey(value);
        return true;
    } catch (err) {
        return false;
    }
});

const publicKeySchema = string().test('is-public-key', 'Invalid public key', value => {
    if (value === undefined) {
        return false;
    }

    try {
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
    sendingToken: publicKeySchema.required(),
    receivingToken: publicKeySchema.required(),
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
    // .required()
    // .test(
    //     'is-comma-separated-no-spaces',
    //     'indexInputs must be a comma separated string with no spaces in individual strings',
    //     value => {
    //         if (typeof value !== 'string') return false;

    //         // TODO: There is some limit to what these input strings can be, figure out what it is
    //         // and validate that constraint here
    //         // Check if every part of the split string is non-empty and does not contain spaces
    //         return value.split(',').every(substring => {
    //             return substring.length > 0 && !substring.includes(' ');
    //         });
    //     }
    // ),
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

export class PaymentTransactionBuilder {
    private sender: web3.PublicKey;
    private receiverWalletAddress: web3.PublicKey | null;
    private receiverTokenAddress: web3.PublicKey | null;
    private sendingToken: web3.PublicKey;
    private receivingToken: web3.PublicKey;
    private feePayer: web3.PublicKey;
    private receivingAmount: number;
    private amountType: AmountType;
    private transactionType: TransactionType;
    private createAta: boolean;
    private singleUseNewAcc: web3.PublicKey | null;
    private singleUsePayer: web3.PublicKey | null;
    private indexInputs: string[] | null;

    constructor(paymentTransactionRequest: PaymentTransactionRequest) {
        console.log(paymentTransactionRequest);
        console.log(paymentTransactionRequest.receiverWalletAddress);

        this.sender = new web3.PublicKey(paymentTransactionRequest.sender);
        this.receiverWalletAddress = paymentTransactionRequest.receiverWalletAddress
            ? new web3.PublicKey(paymentTransactionRequest.receiverWalletAddress)
            : null;
        this.receiverTokenAddress = paymentTransactionRequest.receiverTokenAddress
            ? new web3.PublicKey(paymentTransactionRequest.receiverTokenAddress)
            : null;
        this.sendingToken = new web3.PublicKey(paymentTransactionRequest.sendingToken);
        this.receivingToken = new web3.PublicKey(paymentTransactionRequest.receivingToken);
        this.feePayer = new web3.PublicKey(paymentTransactionRequest.feePayer);
        this.receivingAmount = paymentTransactionRequest.receivingAmount;
        this.amountType = paymentTransactionRequest.amountType as AmountType;
        this.transactionType = paymentTransactionRequest.transactionType as TransactionType;
        this.createAta = paymentTransactionRequest.createAta;
        this.singleUseNewAcc = paymentTransactionRequest.singleUseNewAcc
            ? new web3.PublicKey(paymentTransactionRequest.singleUseNewAcc)
            : null;
        this.singleUsePayer = paymentTransactionRequest.singleUsePayer
            ? new web3.PublicKey(paymentTransactionRequest.singleUsePayer)
            : null;
        this.indexInputs = paymentTransactionRequest.indexInputs
            ? paymentTransactionRequest.indexInputs.split(',')
            : null;
    }

    public async buildPaymentTransaction(connection: web3.Connection): Promise<web3.Transaction> {
        let transaction: web3.Transaction;
        let receivingQuantity: number;
        var swapIxs: web3.TransactionInstruction[] = [];
        var transferIxs: web3.TransactionInstruction[] = [];
        var createIxs: web3.TransactionInstruction[] = [];
        var indexIxs: web3.TransactionInstruction[] = [];

        const blockhash = await connection.getLatestBlockhash();

        console.log(this.receiverWalletAddress);
        console.log(this.receiverTokenAddress);

        switch (this.transactionType) {
            case TransactionType.blockhash:
                transaction = new web3.Transaction({
                    feePayer: this.feePayer,
                    blockhash: blockhash.blockhash,
                    lastValidBlockHeight: blockhash.lastValidBlockHeight,
                });
            case TransactionType.nonce:
                transaction = new web3.Transaction({
                    feePayer: this.feePayer,
                    blockhash: blockhash.blockhash,
                    lastValidBlockHeight: blockhash.lastValidBlockHeight,
                });
        }

        const receivingTokenInformation = await TokenInformation.queryTokenInformationFromPubkey(
            this.receivingToken,
            connection
        );

        switch (this.amountType) {
            case AmountType.quantity:
                receivingQuantity = this.receivingAmount;
                break;
            case AmountType.size:
                receivingQuantity = receivingTokenInformation.convertSizeToQuantity(this.receivingAmount);
                break;
        }

        if (this.sendingToken.toBase58() != this.receivingToken.toBase58()) {
            swapIxs = await createSwapIx({
                provider: 'jupiter',
                quantity: receivingQuantity,
                fromMint: this.sendingToken,
                toMint: this.receivingToken,
                swapingWallet: this.sender,
            });
        }

        transferIxs = await createTransferIx(
            this.sender,
            this.receiverWalletAddress,
            this.receiverTokenAddress,
            receivingTokenInformation,
            receivingQuantity,
            this.createAta,
            connection
        );

        if (this.singleUseNewAcc && this.singleUsePayer) {
            createIxs = await createAccountIx(this.singleUseNewAcc, this.singleUsePayer, connection);
        }

        if (this.indexInputs && this.indexInputs.length > 0) {
            indexIxs = await createIndexingIx(this.feePayer, this.indexInputs);
        }

        transaction = transaction.add(...createIxs, ...swapIxs, ...transferIxs, ...indexIxs);

        return transaction;
    }
}
