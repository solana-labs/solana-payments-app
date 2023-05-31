import { web3 } from '@project-serum/anchor';
import { findPayingWalletFromTransaction } from '../../../src/utilities/transaction-inspection.utility.js';
import { createMockTransaction } from '../../../src/utilities/testing-helper/create-mock.utility.js';

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
        const walletAdress = await findPayingWalletFromTransaction(mockTransaction);
        expect(walletAdress.toBase58()).toEqual(aliceKeypair.publicKey.toBase58());
    });
});
