import { object, string, InferType, boolean, number } from 'yup';
import { parseAndValidate } from '../utils/yup.util.js';
import { web3 } from '@project-serum/anchor';
import { TokenInformation } from '../configs/token-list.config.js';
import { createSwapIx } from '../services/swaps/create-swap-ix.service.js';
import { createTransferIx } from '../services/builders/transfer-ix.builder.js';
import { USDC_PUBKEY } from '../configs/pubkeys.config.js';
import { createAccountIx } from '../services/builders/create-account-ix.builder.js';

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
    receiver: publicKeySchema.required(),
    sendingToken: publicKeySchema.required(),
    receivingToken: publicKeySchema.required(),
    feePayer: publicKeySchema.required(),
    receivingAmount: number().required(),
    amountType: string().oneOf(Object.values(AmountType), 'Invalid amount type').required(),
    transactionType: string().oneOf(Object.values(TransactionType), 'Invalid transaction type').required(),
    createAta: boolean().required(),
    singleUseNewAcc: publicKeySchema.required(),
    singleUsePayer: publicKeySchema.required(),
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
    private receiver: web3.PublicKey;
    private sendingToken: web3.PublicKey;
    private receivingToken: web3.PublicKey;
    private feePayer: web3.PublicKey;
    private receivingAmount: number;
    private amountType: AmountType;
    private transactionType: TransactionType;
    private createAta: boolean;
    private singleUseNewAcc: web3.PublicKey | null;
    private singleUsePayer: web3.PublicKey | null;

    constructor(paymentTransactionRequest: PaymentTransactionRequest) {
        this.sender = new web3.PublicKey(paymentTransactionRequest.sender);
        this.receiver = new web3.PublicKey(paymentTransactionRequest.receiver);
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
    }

    public async buildPaymentTransaction(connection: web3.Connection): Promise<web3.Transaction> {
        let transaction: web3.Transaction;
        let receivingQuantity: number;
        var swapIxs: web3.TransactionInstruction[] = [];
        var transferIxs: web3.TransactionInstruction[] = [];
        var createIxs: web3.TransactionInstruction[] = [];

        const blockhash = await connection.getLatestBlockhash();

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
            this.receiver,
            receivingTokenInformation,
            receivingQuantity,
            this.createAta,
            connection
        );

        if (this.singleUseNewAcc && this.singleUsePayer) {
            createIxs = await createAccountIx(this.singleUseNewAcc, this.singleUsePayer, connection);
        }

        transaction = transaction.add(...swapIxs, ...transferIxs, ...createIxs);

        return transaction;
    }
}
