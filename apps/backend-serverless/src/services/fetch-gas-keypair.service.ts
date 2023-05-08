import { web3 } from "@project-serum/anchor";

export const fetchGasKeypair = async (): Promise<web3.Keypair> => {
  const seedArray = [
    122, 158, 144, 235, 94, 7, 50, 19, 66, 69, 87, 78, 7, 156, 22, 74, 53, 117,
    112, 136, 163, 87, 140, 252, 34, 133, 74, 172, 188, 164, 87, 29, 129, 40,
    148, 116, 85, 147, 135, 143, 47, 146, 12, 136, 125, 107, 239, 235, 15, 14,
    169, 80, 0, 197, 117, 73, 150, 236, 222, 191, 66, 151, 231, 92,
  ];
  let seed = Uint8Array.from(seedArray);
  const keypair = web3.Keypair.fromSecretKey(seed);
  return keypair;
};
