import * as web3 from '@solana/web3.js';
import { createMockTransaction } from '../../../src/utilities/testing-helper/create-mock.utility.js';
import { findPayingWalletFromTransaction } from '../../../src/utilities/transaction-inspection.utility.js';

describe('Transaction Inspection Utility', () => {
    it('should find the paying wallet from a transaction', async () => {
        // Set up the transaction
        const feePayerKeypair = web3.Keypair.generate();
        const aliceKeypair = web3.Keypair.generate();
        const bobKeypair = web3.Keypair.generate();
        const mockTransaction = await createMockTransaction({
            payer: aliceKeypair.publicKey,
            receiver: bobKeypair.publicKey,
            feePayer: feePayerKeypair.publicKey,
        });
        const walletAddress = await findPayingWalletFromTransaction(mockTransaction);
        expect(walletAddress.toBase58()).toEqual(aliceKeypair.publicKey.toBase58());
    });
});
