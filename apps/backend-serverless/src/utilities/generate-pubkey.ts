import { PaymentRecord } from '@prisma/client';
import { web3 } from '@project-serum/anchor';

export const generatePubkeyString = async (paymentRecord: PaymentRecord): Promise<string> => {
    const keypair = web3.Keypair.generate();
    return keypair.publicKey.toBase58();
};
