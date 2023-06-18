import { AxiosResponse } from 'axios';
import axios from 'axios';
import {
    HeliusEnhancedTransactionArray,
    parseAndValidateHeliusEnchancedTransaction,
    HeliusEnhancedTransaction,
} from '../models/dependencies/helius-enhanced-transaction.model.js';
import { parseAndValidateHeliusBalance } from '../models/dependencies/helius-balance.model.js';
import { USDC_MINT } from '../configs/tokens.config.js';
import { DependencyError } from '../errors/dependency.error.js';
import {
    GetAccountInfo,
    PubkeyOwner,
    parseAndValidateGetAccountInfo,
} from '../models/dependencies/get-account-info.model.js';

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

export const fetchHeliusBalance = async (pubkey: string): Promise<HeliusBalance> => {
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

    return heliusBalance;
};

export const fetchUsdcSize = async (pubkey: string): Promise<number> => {
    const heliusBalance = await fetchHeliusBalance(pubkey);

    const usdcTokenBalance = heliusBalance.tokens.find(token => token.mint === USDC_MINT.toBase58());

    if (usdcTokenBalance == null) {
        return 0;
    }

    const usdcSize = usdcTokenBalance.amount / 10 ** usdcTokenBalance.decimals;

    return usdcSize;
};

export const fetchUsdcBalance = async (pubkey: string): Promise<string> => {
    const usdcSize = await fetchUsdcSize(pubkey);
    return `${usdcSize.toFixed(3)} USDC`;
};

export const getAccountInfo = async (pubkey: string): Promise<GetAccountInfo> => {
    let response: AxiosResponse;

    const apiKey = process.env.HELIUS_API_KEY;

    if (apiKey == null) {
        throw new Error('No API key found');
    }

    const getAccountInfoUrl = `https://rpc.helius.xyz/?api-key=${apiKey}`;

    try {
        response = await axios.post(getAccountInfoUrl, {
            jsonrpc: '2.0',
            id: 1,
            method: 'getAccountInfo',
            params: [
                pubkey,
                {
                    encoding: 'jsonParsed',
                },
            ],
        });
    } catch {
        throw new DependencyError('helius rpc get account info');
    }

    const getAccountInfo = parseAndValidateGetAccountInfo(response.data);

    return getAccountInfo;
};

export const getPubkeyType = async (pubkey: string): Promise<PubkeyType> => {
    const accountInfo = await getAccountInfo(pubkey);
    const owner = accountInfo.result.value.owner;
    return getPubkeyTypeForProgramOwner(owner);
};

export enum PubkeyType {
    native = 'native',
    token = 'token',
}

export const getPubkeyTypeForProgramOwner = (owner: PubkeyOwner): PubkeyType => {
    switch (owner) {
        case PubkeyOwner.systemProgram:
            return PubkeyType.native;
        case PubkeyOwner.tokenProgram:
            return PubkeyType.token;
        default:
            throw new Error('Unknown owner');
    }
};
