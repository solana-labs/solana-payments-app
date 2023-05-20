import { object, string, InferType, boolean, number } from 'yup';
import { parseAndValidate } from '../utils/yup.util.js';
import { web3 } from '@project-serum/anchor';
import { AmountType, AmountTypeEnum, TransactionType, TransactionTypeEnum } from './pay-request.model.js';
import { TokenInformation } from '../configs/token-list.config.js';
import { createSwapIx } from '../services/swaps/create-swap-ix.service.js';
import { createTransferIx } from '../services/builders/transfer-ix.builder.js';
import { USDC_PUBKEY } from '../configs/pubkeys.config.js';
import { createAccountIx } from '../services/builders/create-account-ix.builder.js';
import { createIndexingIx } from '../services/builders/create-index-ix.builder.js';

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
    indexInputs: string()
        .required()
        .test(
            'is-comma-separated-no-spaces',
            'indexInputs must be a comma separated string with no spaces in individual strings',
            value => {
                if (typeof value !== 'string') return false;

                // TODO: There is some limit to what these input strings can be, figure out what it is
                // and validate that constraint here
                // Check if every part of the split string is non-empty and does not contain spaces
                return value.split(',').every(substring => {
                    const trimmed = substring.trim();
                    return trimmed.length > 0 && !trimmed.includes(' ');
                });
            }
        ),
});

export type PaymentTransactionRequest = InferType<typeof paymentTransactionRequestScheme>;

export const parseAndValidatePaymentTransactionRequest = (
    paymentTransactionRequestParams: any
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
    private amountType: AmountTypeEnum;
    private transactionType: TransactionTypeEnum;
    private createAta: boolean;
    private singleUseNewAcc: web3.PublicKey | null;
    private singleUsePayer: web3.PublicKey | null;
    private indexInputs: string[];

    constructor(paymentTransactionRequest: PaymentTransactionRequest) {
        this.sender = new web3.PublicKey(paymentTransactionRequest.sender);
        this.receiver = new web3.PublicKey(paymentTransactionRequest.receiver);
        this.sendingToken = new web3.PublicKey(paymentTransactionRequest.sendingToken);
        this.receivingToken = new web3.PublicKey(paymentTransactionRequest.receivingToken);
        this.feePayer = new web3.PublicKey(paymentTransactionRequest.feePayer);
        this.receivingAmount = paymentTransactionRequest.receivingAmount;
        this.amountType = paymentTransactionRequest.amountType as AmountTypeEnum;
        this.transactionType = paymentTransactionRequest.transactionType as TransactionTypeEnum;
        this.createAta = paymentTransactionRequest.createAta;
        this.singleUseNewAcc = paymentTransactionRequest.singleUseNewAcc
            ? new web3.PublicKey(paymentTransactionRequest.singleUseNewAcc)
            : null;
        this.singleUsePayer = paymentTransactionRequest.singleUsePayer
            ? new web3.PublicKey(paymentTransactionRequest.singleUsePayer)
            : null;
        this.indexInputs = paymentTransactionRequest.indexInputs.split(',');
    }

    public async buildPaymentTransaction(connection: web3.Connection): Promise<web3.Transaction> {
        let transaction: web3.Transaction;
        let receivingQuantity: number;
        var swapIxs: web3.TransactionInstruction[] = [];
        var transferIxs: web3.TransactionInstruction[] = [];
        var createIxs: web3.TransactionInstruction[] = [];
        var indexIxs: web3.TransactionInstruction[] = [];

        const blockhash = await connection.getLatestBlockhash();

        switch (this.transactionType) {
            case 'blockhash':
                transaction = new web3.Transaction({
                    feePayer: this.feePayer,
                    blockhash: blockhash.blockhash,
                    lastValidBlockHeight: blockhash.lastValidBlockHeight,
                });
            case 'nonce':
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
            case 'quantity':
                receivingQuantity = this.receivingAmount;
            case 'size':
                receivingQuantity = receivingTokenInformation.convertSizeToQuantity(this.receivingAmount);
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

        // TODO: Make this check for null as well when we make this optional
        if (this.indexInputs.length > 0) {
            indexIxs = await createIndexingIx(this.feePayer, this.indexInputs);
        }

        transaction = transaction.add(...swapIxs, ...transferIxs, ...createIxs, ...indexIxs);

        return transaction;
    }
}
