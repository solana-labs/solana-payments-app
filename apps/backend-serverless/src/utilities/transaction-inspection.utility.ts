import * as Sentry from '@sentry/serverless';
import { TOKEN_PROGRAM_ID, decodeTransferCheckedInstruction } from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import { USDC_MINT } from '../configs/tokens.config.js';
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

    console.log(transferInstruction.programId.toBase58());
    console.log(TOKEN_PROGRAM_ID.toBase58());
    if (transferInstruction.programId.toBase58() != TOKEN_PROGRAM_ID.toBase58()) {
        throw new Error('Invalid transaction');
    }

    const decodedInstruction = decodeTransferCheckedInstruction(transferInstruction);

    const owner = decodedInstruction.keys.owner;

    return owner.pubkey;
};

export const findPayingTokenAddressFromTransaction = async (transaction: web3.Transaction): Promise<web3.PublicKey> => {
    const transferInstruction = transaction.instructions[transaction.instructions.length - 2];

    if (transferInstruction.programId.toBase58() != TOKEN_PROGRAM_ID.toBase58()) {
        const error = new Error('Invalid transaction.' + transferInstruction.programId.toBase58());
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const decodedInstruction = decodeTransferCheckedInstruction(transferInstruction);

    const source = decodedInstruction.keys.source;

    const mint = decodedInstruction.keys.mint;

    if (mint.pubkey.toBase58() != USDC_MINT.toBase58()) {
        const error = new Error('Discovered payment is not in USDC. Can not process.');
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    return source.pubkey;
};
