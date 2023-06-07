import * as web3 from '@solana/web3.js';

export const pubkeyOrThrow = (input: string) => {
    try {
        return new web3.PublicKey(input);
    } catch {
        throw new Error('Could not create a public key with the provided input.');
    }
};
