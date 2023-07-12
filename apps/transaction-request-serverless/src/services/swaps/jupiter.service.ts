import * as web3 from '@solana/web3.js';
import axios from 'axios';
import { JUPITER_URL, createJupiterQuoteRequestUrl } from '../../utilities/jupiter.util.js';
import { SwapIxConfig } from './create-swap-ix.service.js';

const NO_QUOTE_FROM_JUPITER_ERROR_MESSAGE = 'There was no quote availible for your swap.';

const NO_SWAP_FROM_JUPITER_ERROR_MESSAGE = 'There was no quote availible for your swap.';

const JUPITER_SWAP_REQUEST_URL = `${JUPITER_URL}/swap`;

export const createJupiterSwapIx = async (config: SwapIxConfig): Promise<web3.TransactionInstruction[]> => {
    const { data } = await axios.get(createJupiterQuoteRequestUrl(config.quantity, config.fromMint, config.toMint));

    if (data == null || data == undefined || data.data == null || data.data == undefined) {
        throw new Error(NO_QUOTE_FROM_JUPITER_ERROR_MESSAGE);
    }

    const route = data.data[0];

    const responseTransactions = await axios.post(
        JUPITER_SWAP_REQUEST_URL,
        JSON.stringify({
            route: route,
            userPublicKey: config.swapingWallet.toBase58(),
            wrapUnwrapSOL: true,
        }),
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );

    const { swapTransaction } = responseTransactions.data;

    if (swapTransaction == null || swapTransaction == undefined) {
        throw new Error(NO_SWAP_FROM_JUPITER_ERROR_MESSAGE);
    }

    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');

    const swapTransactionIxs = web3.Transaction.from(swapTransactionBuf).instructions;

    return swapTransactionIxs;
};
