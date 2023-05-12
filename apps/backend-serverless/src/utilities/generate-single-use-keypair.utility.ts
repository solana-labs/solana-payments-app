import { PaymentRecord } from '@prisma/client';
import { web3 } from '@project-serum/anchor';

export const generateSingleUseKeypairFromPaymentRecord = async (paymentRecord: PaymentRecord) => {
    const shopifyStrings = ['shopify', paymentRecord.shopId];
    const hashedPublicKey = await hashIntoPublicKey(shopifyStrings);
    const seed: Uint8Array = Uint8Array.from(hashedPublicKey.toBuffer());
    const keypair = web3.Keypair.fromSeed(seed);
    return keypair;
};

const hashIntoPublicKey = async (inputs: string[]) => {
    return await web3.PublicKey.findProgramAddressSync(
        inputs.map(input => Buffer.from(input)),
        web3.SystemProgram.programId
    )[0];
};
