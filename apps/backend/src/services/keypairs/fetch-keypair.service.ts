import { web3 } from "@project-serum/anchor";

// There is probably a bunch of fancy things we can do here like

// 1. check the dev enviroment and return different keys from different locations
// 2. check how much gas is remaining
// 3. have different types of keypairs for different types of transactions
export const fetchKeypair = async (
  keypairId: string
): Promise<web3.Keypair> => {
  return web3.Keypair.generate();
};
