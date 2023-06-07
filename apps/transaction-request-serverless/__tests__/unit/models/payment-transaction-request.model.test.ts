import {
    AmountType,
    TransactionType,
    parseAndValidatePaymentTransactionRequest,
} from '../../../src/models/payment-transaction-request.model.js';
import * as web3 from '@solana/web3.js';

describe('unit testing the payment transaction request model', () => {
    it('valid transaction request model', () => {
        const receiver = web3.Keypair.generate().publicKey.toBase58();
        const feePayer = web3.Keypair.generate().publicKey.toBase58();
        const singleUseNewAcc = web3.Keypair.generate().publicKey.toBase58();
        const singleUsePayer = web3.Keypair.generate().publicKey.toBase58();

        const mockTransactionRequestQueryParameters = {
            receiver: receiver,
            sendingToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            receivingToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            feePayer: feePayer,
            receivingAmount: 1,
            amountType: AmountType.size,
            transactionType: TransactionType.blockhash,
            createAta: true,
            singleUseNewAcc: singleUseNewAcc,
            singleUsePayer: singleUsePayer,
            indexInputs: 'hello,world',
        };

        expect(() => {
            parseAndValidatePaymentTransactionRequest(mockTransactionRequestQueryParameters);
        }).not.toThrow();
    });

    it('valid transaction request model, defaults removed', () => {
        const receiver = web3.Keypair.generate().publicKey.toBase58();
        const feePayer = web3.Keypair.generate().publicKey.toBase58();
        const singleUseNewAcc = web3.Keypair.generate().publicKey.toBase58();
        const singleUsePayer = web3.Keypair.generate().publicKey.toBase58();

        const mockTransactionRequestQueryParameters = {
            receiver: receiver,
            sendingToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            receivingToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            feePayer: feePayer,
            receivingAmount: 1,
            singleUseNewAcc: singleUseNewAcc,
            singleUsePayer: singleUsePayer,
            indexInputs: 'hello,world',
        };

        expect(() => {
            parseAndValidatePaymentTransactionRequest(mockTransactionRequestQueryParameters);
        }).not.toThrow();
    });

    it('invalid transaction request model, missing sending token', () => {
        const receiver = web3.Keypair.generate().publicKey.toBase58();
        const feePayer = web3.Keypair.generate().publicKey.toBase58();
        const singleUseNewAcc = web3.Keypair.generate().publicKey.toBase58();
        const singleUsePayer = web3.Keypair.generate().publicKey.toBase58();

        const mockTransactionRequestQueryParameters = {
            receiver: receiver,
            receivingToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            feePayer: feePayer,
            receivingAmount: 1,
            singleUseNewAcc: singleUseNewAcc,
            singleUsePayer: singleUsePayer,
            indexInputs: 'hello,world',
        };

        expect(() => {
            parseAndValidatePaymentTransactionRequest(mockTransactionRequestQueryParameters);
        }).toThrow();
    });
});
