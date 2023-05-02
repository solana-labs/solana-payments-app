import * as anchor from "@project-serum/anchor";

export const createJupiterQuoteRequestUrl = (
  quantity: number,
  fromMint: anchor.web3.PublicKey,
  toMint: anchor.web3.PublicKey
) => {
  const jupiterQuoteUrl = `https://quote-api.jup.ag/v4/quote?inputMint=${fromMint}&outputMint=${toMint}&amount=${quantity}&slippageBps=1&swapMode=ExactOut`;
  return jupiterQuoteUrl;
};
