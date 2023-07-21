import axios, { AxiosResponse } from 'axios';
import { USDC_MINT } from '../configs/tokens.config.js';
import { DependencyError } from '../errors/dependency.error.js';
import { InvalidInputError } from '../errors/invalid-input.error.js';
import {
    GetAccountInfo,
    PubkeyOwner,
    ValueDataTokenProgram,
    parseAndValidateGetAccountInfo,
} from '../models/dependencies/get-account-info.model.js';
import { parseAndValidateHeliusBalance } from '../models/dependencies/helius-balance.model.js';
import {
    HeliusEnhancedTransaction,
    HeliusEnhancedTransactionArray,
    parseAndValidateHeliusEnchancedTransaction,
} from '../models/dependencies/helius-enhanced-transaction.model.js';

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
        throw new Error('Failed to fetch transaction from Helius');
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

export const fetchBalance = async (publicKey: string, mint: string): Promise<number> => {
    let response: AxiosResponse;

    const apiKey = process.env.HELIUS_API_KEY;

    if (apiKey == null) {
        throw new Error('No API key found');
    }

    const heliusBalanceApiUrl = `https://api.helius.xyz/v0/addresses/${publicKey}/balances?api-key=${apiKey}`;

    try {
        response = await axios.get(heliusBalanceApiUrl);
    } catch {
        throw new Error('Failed to fetch transaction from Helius.');
    }

    const heliusBalance = parseAndValidateHeliusBalance(response.data);

    const tokenBalance = heliusBalance.tokens.find(token => token.mint === mint);

    if (tokenBalance == null) {
        return 0;
    }

    return tokenBalance.amount / 10 ** tokenBalance.decimals;
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
    console.log('testing here');
    const owner = accountInfo.result.value.owner;
    const pubkeyType = getPubkeyTypeForProgramOwner(owner);
    console.log(pubkeyType);
    if (pubkeyType == PubkeyType.token) {
        const data = accountInfo.result.value.data as ValueDataTokenProgram;
        const mint = data.parsed.info.mint;
        if (mint != USDC_MINT.toBase58()) {
            throw new InvalidInputError('Payment address must be a public key or a USDC token account address.');
        }
    }

    return pubkeyType;
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
            throw new InvalidInputError(
                'Invalid payment address input. You must enter a wallet address or USDC token account address.'
            );
    }
};
