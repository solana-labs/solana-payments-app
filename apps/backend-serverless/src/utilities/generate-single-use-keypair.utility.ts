import * as web3 from '@solana/web3.js';
import { ShopifyRecord } from '../services/database/record-service.database.service.js';

export const generateSingleUseKeypairFromRecord = async (record: ShopifyRecord) => {
    const shopifyStrings = ['shopify', record.shopId];
    const hashedPublicKey = await hashIntoPublicKey(shopifyStrings);
    const seed: Uint8Array = Uint8Array.from(hashedPublicKey.toBuffer());
    const keypair = web3.Keypair.fromSeed(seed);
    return keypair;
};

const hashIntoPublicKey = async (inputs: string[]) => {
    return await web3.PublicKey.findProgramAddressSync(
        inputs.map(input => Buffer.from(input)),
        web3.SystemProgram.programId,
    )[0];
};
