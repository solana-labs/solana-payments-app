import axios from 'axios';
import { web3 } from '@project-serum/anchor';
import pkg from 'bs58';
const { decode } = pkg;

export const fetchTransaction = async (transactionId: string): Promise<web3.Transaction> => {
    const response = await axios({
        url: 'https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e',
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
