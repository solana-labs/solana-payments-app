import * as anchor from '@project-serum/anchor';

export const JUPITER_URL = 'https://quote-api.jup.ag/v4';

export const createJupiterQuoteRequestUrl = (
    quantity: number,
    fromMint: anchor.web3.PublicKey,
    toMint: anchor.web3.PublicKey
) => {
    const jupiterQuoteUrl = `${JUPITER_URL}/quote?inputMint=${fromMint}&outputMint=${toMint}&amount=${quantity}&slippageBps=10&swapMode=ExactOut`;
    return jupiterQuoteUrl;
};
