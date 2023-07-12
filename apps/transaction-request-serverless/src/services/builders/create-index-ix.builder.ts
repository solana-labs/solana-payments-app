import * as web3 from '@solana/web3.js';
import { MEMO_PROGRAM_ID } from '../../configs/pubkeys.config.js';
import { createIndexPubkey } from '../../utilities/create-index-pubkey.utility.js';

// This will be a function to create the instruction to create a memo and add on index pubkeys. This is a utility
// instruction that can be used when you're using API based transaction fetching and you want to include some pubkeys on
// the tx to later use for indexing or searching on chain.
export const createIndexingIx = async (
    signer: web3.PublicKey,
    indexInputs: string[]
): Promise<web3.TransactionInstruction[]> => {
    // TODO: There is some limit on the input size we can use verify that all of the strings in indexInputs
    // once we figure out that limit, we should validate the inputs here

    const indexPubkeys = await Promise.all(
        indexInputs.map(async input => {
            const result = await createIndexPubkey(input);
            return result;
        })
    );

    const ixKeys = [
        {
            pubkey: signer,
            isSigner: true,
            isWritable: true,
        },
    ];

    for (const index of indexPubkeys) {
        ixKeys.push({
            pubkey: index,
            isSigner: false,
            isWritable: false,
        });
    }

    let dataBuffer: Buffer;

    try {
        dataBuffer = Buffer.from('solana pay memo');
    } catch {
        throw new Error('Could not create memo data buffer');
    }

    const ix = new web3.TransactionInstruction({
        keys: ixKeys,
        programId: MEMO_PROGRAM_ID,
        data: dataBuffer,
    });

    return [ix];
};
