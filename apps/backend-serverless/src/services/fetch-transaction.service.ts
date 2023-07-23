import * as web3 from '@solana/web3.js';
import axios from 'axios';
import pkg from 'bs58';
import { MissingEnvError } from '../errors/missing-env.error';
const { decode } = pkg;

export const fetchTransaction = async (transactionId: string): Promise<web3.Transaction> => {
    const heliusApiKey = process.env.HELIUS_API_KEY;

    if (heliusApiKey == null) {
        throw new MissingEnvError('helius api key');
    }

    console.log('fetching transaction');

    const response = await axios({
        url: 'https://rpc.helius.xyz/?api-key=' + heliusApiKey,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({
            jsonrpc: '2.0',
            method: 'getTransaction',
            id: '1',
            params: [transactionId, { encoding: 'base58', commitment: 'confirmed' }],
        }),
    });

    console.log(response.data);

    const decodedTransaction = decode(response.data.result.transaction[0]);
    const tx = web3.Transaction.from(decodedTransaction);

    return tx;
};
