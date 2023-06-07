import * as web3 from '@solana/web3.js';

export const JUPITER_URL = 'https://quote-api.jup.ag/v4';

export const createJupiterQuoteRequestUrl = (quantity: number, fromMint: web3.PublicKey, toMint: web3.PublicKey) => {
    const jupiterQuoteUrl = `${JUPITER_URL}/quote?inputMint=${fromMint}&outputMint=${toMint}&amount=${quantity}&slippageBps=10&swapMode=ExactOut`;
    return jupiterQuoteUrl;
};
