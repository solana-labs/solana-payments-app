import * as web3 from '@solana/web3.js';
import axios from 'axios';
import pkg from 'bs58';
import { getConnectionUrl } from '../utilities/connection.utility.js';
const { decode } = pkg;

export const fetchTransaction = async (transactionId: string): Promise<web3.Transaction | null> => {
    try {
        const response = await axios({
            url: getConnectionUrl(),
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({
                jsonrpc: '2.0',
                method: 'getTransaction',
                id: '1',
                params: [transactionId, { encoding: 'base58', commitment: 'confirmed' }],
            }),
        });

        const decodedTransaction = decode(response.data.result.transaction[0]);
        const tx = web3.Transaction.from(decodedTransaction);

        return tx;
    } catch (error) {
        // TODO check why failed
        return null;
    }
};
