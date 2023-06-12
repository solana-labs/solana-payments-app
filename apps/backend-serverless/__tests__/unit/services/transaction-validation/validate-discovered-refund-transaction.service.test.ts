import { RefundRecord, RefundRecordStatus } from '@prisma/client';
import { TOKEN_PROGRAM_ID, createTransferCheckedInstruction } from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import { USDC_MINT } from '../../../../src/configs/tokens.config.js';
import { findAssociatedTokenAddress } from '../../../../src/utilities/pubkeys.utility.js';
import { verifyTransactionWithRecord } from '../../../../src/services/transaction-validation/validate-discovered-payment-transaction.service.js';

describe('unit testing validating discovered payment transactions', () => {
    it('valid transaction transfer', async () => {
        // Set up the mock record
        const mockRefundRecord: RefundRecord = {
            id: 'mock-id',
            status: RefundRecordStatus.pending,
            amount: 10,
            currency: 'USD',
            usdcAmount: 10,
            shopId: 'mock-shop-id',
            shopGid: 'mock-shop-gid',
            shopPaymentId: 'mock-shop-payment-id',
            test: false,
            merchantId: 'mock-merchant-id',
            transactionSignature: 'some-transaction-signature',
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
            verifyTransactionWithRecord(mockRefundRecord, mockTransaction, false);
        }).not.toThrow();
    });
});
