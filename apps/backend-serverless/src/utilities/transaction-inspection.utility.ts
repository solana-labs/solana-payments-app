import * as web3 from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, decodeTransferCheckedInstruction } from '@solana/spl-token';

/**
 *
 * @param transaction the transaction to inspect
 * @returns the paying wallet of the transaction
 *
 * @remarks Per our current design, the payment is made in the second to last slot of every transaction
 */
export const findPayingWalletFromTransaction = async (transaction: web3.Transaction): Promise<web3.PublicKey> => {
    // First thing to do is validate it's a valid transaction

    console.log('M8');
    const transferInstruction = transaction.instructions[transaction.instructions.length - 2];

    console.log(transferInstruction.programId.toBase58());
    console.log(TOKEN_PROGRAM_ID.toBase58());
    if (transferInstruction.programId.toBase58() != TOKEN_PROGRAM_ID.toBase58()) {
        throw new Error('Invalid transaction');
    }

    console.log(transferInstruction);

    const decodedInstruction = decodeTransferCheckedInstruction(transferInstruction);

    console.log(decodedInstruction);
    const owner = decodedInstruction.keys.owner;

    // Verify this is a pda relationship for usdc ??? maybe not needed ???

    return owner.pubkey;
};
