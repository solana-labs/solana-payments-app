import {
    verifyTransferInstructionIsCorrect,
    verifyTransactionWithRecord,
    verifySingleUseInstruction,
} from '../../../../src/services/transaction-validation/validate-discovered-payment-transaction.service.js';
import { TOKEN_PROGRAM_ID, createTransferCheckedInstruction } from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import { USDC_MINT } from '../../../../src/configs/tokens.config.js';
import { findAssociatedTokenAddress } from '../../../../src/utilities/pubkeys.utility.js';
import { createMockPaymentRecord } from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('unit testing validating discovered payment transactions', () => {
    beforeEach(() => {});

    it('valid transaction transfer', async () => {
        // Set up the mock record
        const mockPaymentRecord = createMockPaymentRecord({ amount: 10, usdcAmount: 10 });

        // Set up the transaction
        const aliceKeypair = web3.Keypair.generate();
        const aliceAta = await findAssociatedTokenAddress(aliceKeypair.publicKey, USDC_MINT);
        const bobKeypair = web3.Keypair.generate();
        const bobAta = await findAssociatedTokenAddress(bobKeypair.publicKey, USDC_MINT);
        const transferQuantity = 10 * 10 ** 6;
        const transferCheckedInstruction = createTransferCheckedInstruction(
            aliceAta,
            USDC_MINT,
            bobAta,
            aliceKeypair.publicKey,
            transferQuantity,
            6,
            [],
            TOKEN_PROGRAM_ID
        );
        const mockTransaction = new web3.Transaction().add(transferCheckedInstruction).add(transferCheckedInstruction);

        // Verify the transaction
        expect(() => {
            verifyTransferInstructionIsCorrect(mockTransaction, mockPaymentRecord);
        }).not.toThrow();
    });

    it('invalid transaction transfer, incorrect amount', async () => {
        // Set up the mock record
        const mockPaymentRecord = createMockPaymentRecord({ amount: 10, usdcAmount: 10 });

        // Set up the transaction
        const aliceKeypair = web3.Keypair.generate();
        const aliceAta = await findAssociatedTokenAddress(aliceKeypair.publicKey, USDC_MINT);
        const bobKeypair = web3.Keypair.generate();
        const bobAta = await findAssociatedTokenAddress(bobKeypair.publicKey, USDC_MINT);
        const transferQuantity = 10;
        const transferCheckedInstruction = createTransferCheckedInstruction(
            aliceAta,
            USDC_MINT,
            bobAta,
            aliceKeypair.publicKey,
            transferQuantity,
            6,
            [],
            TOKEN_PROGRAM_ID
        );
        const mockTransaction = new web3.Transaction().add(transferCheckedInstruction).add(transferCheckedInstruction);

        // Verify the transaction
        expect(() => {
            verifyTransferInstructionIsCorrect(mockTransaction, mockPaymentRecord);
        }).toThrow();
    });

    it('invalid transaction transfer, incorrect mint', async () => {
        // Set up the mock record
        const mockPaymentRecord = createMockPaymentRecord({ amount: 10, usdcAmount: 10 });

        // Set up the transaction
        const aliceKeypair = web3.Keypair.generate();
        const mintKeypair = web3.Keypair.generate();
        const aliceAta = await findAssociatedTokenAddress(aliceKeypair.publicKey, mintKeypair.publicKey);
        const bobKeypair = web3.Keypair.generate();
        const bobAta = await findAssociatedTokenAddress(bobKeypair.publicKey, mintKeypair.publicKey);
        const transferQuantity = 10;
        const transferCheckedInstruction = createTransferCheckedInstruction(
            aliceAta,
            mintKeypair.publicKey,
            bobAta,
            aliceKeypair.publicKey,
            transferQuantity,
            6,
            [],
            TOKEN_PROGRAM_ID
        );
        const mockTransaction = new web3.Transaction().add(transferCheckedInstruction).add(transferCheckedInstruction);

        // Verify the transaction
        expect(() => {
            verifyTransferInstructionIsCorrect(mockTransaction, mockPaymentRecord);
        }).toThrow();
    });

    it('valid transaction transfer, testing verifySingleUseInstruction', async () => {
        // Set up the transaction
        const aliceKeypair = web3.Keypair.generate();
        const bobKeypair = web3.Keypair.generate();
        const ix = web3.SystemProgram.createAccount({
            fromPubkey: aliceKeypair.publicKey,
            newAccountPubkey: bobKeypair.publicKey,
            lamports: 0,
            space: 0,
            programId: web3.SystemProgram.programId,
        });
        const mockTransaction = new web3.Transaction().add(ix);

        // Verify the transaction
        expect(() => {
            verifySingleUseInstruction(mockTransaction);
        }).not.toThrow();
    });

    it('valid transaction, testing verifyPaymentTransactionWithPaymentRecord', async () => {
        // Set up the mock record
        const mockPaymentRecord = createMockPaymentRecord({ amount: 10, usdcAmount: 10 });

        // Set up the transaction
        const aliceKeypair = web3.Keypair.generate();
        const aliceAta = await findAssociatedTokenAddress(aliceKeypair.publicKey, USDC_MINT);
        const bobKeypair = web3.Keypair.generate();
        const bobAta = await findAssociatedTokenAddress(bobKeypair.publicKey, USDC_MINT);
        const transferQuantity = 10 * 10 ** 6;
        const transferCheckedInstruction = createTransferCheckedInstruction(
            aliceAta,
            USDC_MINT,
            bobAta,
            aliceKeypair.publicKey,
            transferQuantity,
            6,
            [],
            TOKEN_PROGRAM_ID
        );
        const ix = web3.SystemProgram.createAccount({
            fromPubkey: aliceKeypair.publicKey,
            newAccountPubkey: bobKeypair.publicKey,
            lamports: 0,
            space: 0,
            programId: web3.SystemProgram.programId,
        });
        const mockTransaction = new web3.Transaction()
            .add(ix)
            .add(transferCheckedInstruction)
            .add(transferCheckedInstruction);

        // Verify the transaction
        expect(() => {
            verifyTransactionWithRecord(mockPaymentRecord, mockTransaction, false);
        }).not.toThrow();
    });
});
