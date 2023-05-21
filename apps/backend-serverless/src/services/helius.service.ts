import { AxiosResponse } from 'axios';
import axios from 'axios';
import {
    HeliusEnhancedTransactionArray,
    parseAndValidateHeliusEnchancedTransaction,
    HeliusEnhancedTransaction,
} from '../models/helius-enhanced-transaction.model.js';

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
