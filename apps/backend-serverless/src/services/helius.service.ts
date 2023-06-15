import { AxiosResponse } from 'axios';
import axios from 'axios';
import {
    HeliusEnhancedTransactionArray,
    parseAndValidateHeliusEnchancedTransaction,
    HeliusEnhancedTransaction,
} from '../models/dependencies/helius-enhanced-transaction.model.js';
import { HeliusBalance, parseAndValidateHeliusBalance } from '../models/dependencies/helius-balance.model.js';
import { USDC_MINT } from '../configs/tokens.config.js';

export const fetchEnhancedTransaction = async (transactionId: string): Promise<HeliusEnhancedTransaction | null> => {
    let heliusEnhancedTransactions: HeliusEnhancedTransactionArray;
    let response: AxiosResponse;

    const apiKey = process.env.HELIUS_API_KEY;

    if (apiKey == null) {
        throw new Error('No API key found');
    }

    const heliusTransactionApiUrl = 'https://api.helius.xyz/v0/transactions/?api-key=' + apiKey;

    try {
        response = await axios.post(heliusTransactionApiUrl, { transactions: [transactionId] });
    } catch {
        throw new Error('Failed to fetch transaction from Helius.');
    }

    try {
        heliusEnhancedTransactions = parseAndValidateHeliusEnchancedTransaction(response.data);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Could not parse Helius response. Unknwon error');
        }
    }

    if (heliusEnhancedTransactions == null || heliusEnhancedTransactions.length == 0) {
        return null;
    }

    return heliusEnhancedTransactions[0];
};

export const fetchUsdcBalance = async (pubkey: string): Promise<string> => {
    let response: AxiosResponse;

    const apiKey = process.env.HELIUS_API_KEY;

    if (apiKey == null) {
        throw new Error('No API key found');
    }

    const heliusBalanceApiUrl = `https://api.helius.xyz/v0/addresses/${pubkey}/balances?api-key=${apiKey}`;

    try {
        response = await axios.get(heliusBalanceApiUrl);
    } catch {
        throw new Error('Failed to fetch transaction from Helius.');
    }

    const heliusBalance = parseAndValidateHeliusBalance(response.data);

    const usdcTokenBalance = heliusBalance.tokens.find(token => token.mint === USDC_MINT.toBase58());

    if (usdcTokenBalance == null) {
        return '0 USDC';
    }

    return `${usdcTokenBalance.amount} USDC`;
};

// export class HeliusService {
//     constructor(private apiKey: string, private axiosInstance: typeof axios) {}

//     private async fetchBalance(pubkey: string): Promise<HeliusBalance> {
//         let response: AxiosResponse;

//         const apiKey = process.env.HELIUS_API_KEY;

//         if (apiKey == null) {
//             throw new Error('No API key found');
//         }

//         const heliusBalanceApiUrl = `https://api.helius.xyz/v0/addresses/${pubkey}/balances?api-key=${apiKey}`;

//         try {
//             response = await axios.get(heliusBalanceApiUrl);
//         } catch {
//             throw new Error('Failed to fetch transaction from Helius.');
//         }

//         const heliusBalance = parseAndValidateHeliusBalance(response.data);
//     }
// }
