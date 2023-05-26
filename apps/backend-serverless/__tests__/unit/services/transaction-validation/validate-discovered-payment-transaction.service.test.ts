import {
    verifyTransferInstructionIsCorrect,
    verifyPaymentTransactionWithPaymentRecord,
} from '../../../../src/services/transaction-validation/validate-discovered-payment-transaction.service.js';
import { PaymentRecord, PaymentRecordStatus } from '@prisma/client';
import { TOKEN_PROGRAM_ID, createTransferCheckedInstruction } from '@solana/spl-token';
import { web3 } from '@project-serum/anchor';
import { create } from 'lodash';
import { USDC_MINT } from '../../../../src/configs/tokens.config.js';

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: web3.PublicKey = new web3.PublicKey(
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
);

export async function findAssociatedTokenAddress(
    walletAddress: web3.PublicKey,
    tokenMintAddress: web3.PublicKey
): Promise<web3.PublicKey> {
    return (
        await web3.PublicKey.findProgramAddress(
            [walletAddress.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMintAddress.toBuffer()],
            SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
        )
    )[0];
}

describe('unit testing validating discovered payment transactions', () => {
    beforeEach(() => {});

    it('valid transaction transfer', async () => {
        // Set up the mock record
        const mockPaymentRecord: PaymentRecord = {
            id: 'mock-id',
            status: PaymentRecordStatus.pending,
            shopId: 'mock-shop-id',
            shopGid: 'mock-shop-gid',
            shopGroup: 'mock-shop-group',
            test: false,
            amount: 10,
            currency: 'USD',
            usdcAmount: 10,
            cancelURL: 'mock-cancel-url',
            merchantId: 'mock-merchant-id',
            transactionSignature: 'mock-transaction-signature',
            redirectUrl: 'mock-redirect-url',
            requestedAt: new Date(),
            completedAt: new Date(),
        };

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
        const mockPaymentRecord: PaymentRecord = {
            id: 'mock-id',
            status: PaymentRecordStatus.pending,
            shopId: 'mock-shop-id',
            shopGid: 'mock-shop-gid',
            shopGroup: 'mock-shop-group',
            test: false,
            amount: 10,
            currency: 'USD',
            usdcAmount: 10,
            cancelURL: 'mock-cancel-url',
            merchantId: 'mock-merchant-id',
            transactionSignature: 'mock-transaction-signature',
            redirectUrl: 'mock-redirect-url',
            requestedAt: new Date(),
            completedAt: new Date(),
        };

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
        const mockPaymentRecord: PaymentRecord = {
            id: 'mock-id',
            status: PaymentRecordStatus.pending,
            shopId: 'mock-shop-id',
            shopGid: 'mock-shop-gid',
            shopGroup: 'mock-shop-group',
            test: false,
            amount: 10,
            currency: 'USD',
            usdcAmount: 10,
            cancelURL: 'mock-cancel-url',
            merchantId: 'mock-merchant-id',
            transactionSignature: 'mock-transaction-signature',
            redirectUrl: 'mock-redirect-url',
            requestedAt: new Date(),
            completedAt: new Date(),
        };

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

    it('valid transaction, testing verifyPaymentTransactionWithPaymentRecord', async () => {
        // Set up the mock record
        const mockPaymentRecord: PaymentRecord = {
            id: 'mock-id',
            status: PaymentRecordStatus.pending,
            shopId: 'mock-shop-id',
            shopGid: 'mock-shop-gid',
            shopGroup: 'mock-shop-group',
            test: false,
            amount: 10,
            currency: 'USD',
            usdcAmount: 10,
            cancelURL: 'mock-cancel-url',
            merchantId: 'mock-merchant-id',
            transactionSignature: 'mock-transaction-signature',
            redirectUrl: 'mock-redirect-url',
            requestedAt: new Date(),
            completedAt: new Date(),
        };

        // Set up the transaction
        const feePayer = new web3.PublicKey('9hBUxihyvswYSExF8s7K5SZiS3XztF3DAT7eTZ5krx4T');
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
            verifyPaymentTransactionWithPaymentRecord(mockPaymentRecord, mockTransaction, false);
        }).toThrow();
    });
});
