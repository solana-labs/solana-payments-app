import { web3 } from '@project-serum/anchor';

export const pubkeyOrThrow = (input: string) => {
    try {
        return new web3.PublicKey(input);
    } catch {
        throw new Error('Could not create a public key with the provided input.');
    }
};
