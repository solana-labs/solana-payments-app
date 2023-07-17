import * as web3 from '@solana/web3.js';
import { TokenInformation } from '../../configs/token-list.config.js';
import {
    AmountType,
    PaymentTransactionRequest,
    TransactionType,
} from '../../models/payment-transaction-request.model.js';
import { createAccountIx } from '../../services/builders/create-account-ix.builder.js';
import { createIndexingIx } from '../../services/builders/create-index-ix.builder.js';
import { createTransferIx } from '../../services/builders/transfer-ix.builder.js';
import { createSwapIx } from '../../services/swaps/create-swap-ix.service.js';

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
        let swapIxs: web3.TransactionInstruction[] = [];
        let transferIxs: web3.TransactionInstruction[] = [];
        let createIxs: web3.TransactionInstruction[] = [];
        let indexIxs: web3.TransactionInstruction[] = [];

        const blockhash = await connection.getLatestBlockhash();

        switch (this.transactionType) {
            case TransactionType.blockhash:
                transaction = new web3.Transaction({
                    feePayer: this.feePayer,
                    blockhash: blockhash.blockhash,
                    lastValidBlockHeight: blockhash.lastValidBlockHeight,
                });
                break;
            case TransactionType.nonce:
                transaction = new web3.Transaction({
                    feePayer: this.feePayer,
                    blockhash: blockhash.blockhash,
                    lastValidBlockHeight: blockhash.lastValidBlockHeight,
                });
                break;
        }

        const receivingTokenInformation = await TokenInformation.queryTokenInformationFromPubkey(
            this.receivingToken,
            connection,
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
            connection,
            this.feePayer,
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
