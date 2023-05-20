import { web3 } from '@project-serum/anchor';

export const createIndexPubkey = async (input: string): Promise<web3.PublicKey> => {
    // TODO: There is some max length on what our input string can be, figure it out and validate
    // the constraint here
    return await web3.PublicKey.findProgramAddressSync([Buffer.from(input)], web3.SystemProgram.programId)[0];
};
