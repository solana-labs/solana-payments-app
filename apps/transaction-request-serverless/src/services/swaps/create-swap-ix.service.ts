<<<<<<< HEAD
import * as anchor from "@project-serum/anchor";
import { createJupiterSwapIx } from "./jupiter.service.js";

export type SwapProvider = "jupiter";

export interface SwapIxConfig {
  provider: SwapProvider;
  quantity: number;
  swapingWallet: anchor.web3.PublicKey;
  fromMint: anchor.web3.PublicKey;
  toMint: anchor.web3.PublicKey;
}

export const createSwapIx = async (
  config: SwapIxConfig
): Promise<anchor.web3.TransactionInstruction[]> => {
  switch (config.provider) {
    case "jupiter":
      return createJupiterSwapIx(config);
  }
};
=======
import * as anchor from '@project-serum/anchor'
import { createJupiterSwapIx } from './jupiter.service.js'

export type SwapProvider = 'jupiter'

export interface SwapIxConfig {
    provider: SwapProvider
    quantity: number
    swapingWallet: anchor.web3.PublicKey
    fromMint: anchor.web3.PublicKey
    toMint: anchor.web3.PublicKey
}

export const createSwapIx = async (
    config: SwapIxConfig
): Promise<anchor.web3.TransactionInstruction[]> => {
    switch (config.provider) {
        case 'jupiter':
            return createJupiterSwapIx(config)
    }
}
>>>>>>> main
