import { web3 } from '@project-serum/anchor';
import { findAssociatedTokenAddress } from '../services/transaction-validation/validate-discovered-payment-transaction.service.test';
import { USDC_MINT } from '../../../src/configs/tokens.config';
import { TOKEN_PROGRAM_ID, createTransferCheckedInstruction } from '@solana/spl-token';
import { findPayingWalletFromTransaction } from '../../../src/utilities/transaction-inspection.utility';

describe('Transaction Inspection Utility', () => {
    it('should find the paying wallet from a transaction', async () => {
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
        const walletAdress = await findPayingWalletFromTransaction(mockTransaction);
        expect(walletAdress.toBase58()).toEqual(aliceKeypair.publicKey.toBase58());
    });
});
