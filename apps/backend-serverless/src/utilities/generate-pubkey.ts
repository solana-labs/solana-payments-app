import { web3 } from '@project-serum/anchor';

export const generatePubkeyString = (): string => {
    const keypair = web3.Keypair.generate();
    return keypair.publicKey.toBase58();
};
