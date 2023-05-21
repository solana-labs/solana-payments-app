import { web3 } from '@project-serum/anchor';

// This will be a function to create the instructions to create a system program account. This is a utility
// instruction that can be used when you're using API based transaction fetching and you only want a transaction to be
// run once. You can create a deterinistic keypair and use that as the newAccountPubkey. This account can only be created
// on chain once. This is a solution for a lack of a custom on chain program.
export const createAccountIx = async (
    newAccountPubkey: web3.PublicKey,
    fromPubkey: web3.PublicKey,
    connection: web3.Connection
): Promise<web3.TransactionInstruction[]> => {
    const rent = await connection.getMinimumBalanceForRentExemption(0);

    const ix = web3.SystemProgram.createAccount({
        fromPubkey,
        newAccountPubkey,
        lamports: rent,
        space: 0,
        programId: web3.SystemProgram.programId,
    });

    return [ix];
};
