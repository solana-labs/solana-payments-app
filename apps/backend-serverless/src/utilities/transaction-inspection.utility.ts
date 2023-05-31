import { web3 } from '@project-serum/anchor';
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

    const transferInstruction = transaction.instructions[transaction.instructions.length - 2];

    if (transferInstruction.programId.toBase58() != TOKEN_PROGRAM_ID.toBase58()) {
        throw new Error('Invalid transaction');
    }

    const decodedInstruction = decodeTransferCheckedInstruction(transferInstruction);

    const owner = decodedInstruction.keys.owner;
    const source = decodedInstruction.keys.source;

    // Verify this is a pda relationship for usdc ??? maybe not needed ???

    return owner.pubkey;
};
