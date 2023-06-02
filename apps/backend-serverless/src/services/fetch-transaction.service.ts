import fetch from 'node-fetch';
import { web3 } from '@project-serum/anchor';
import pkg from 'bs58';
const { decode } = pkg;

export const fetchTransaction = async (transactionId: string): Promise<web3.Transaction> => {
    const {
        result: {
            transaction: [bs58Transaction],
        },
    } = await (
        await fetch('https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'getTransaction',
                id: '1',
                params: [transactionId, { encoding: 'base58' }],
            }),
        })
    ).json();

    const decodedTransaction = decode(bs58Transaction);

    const tx = web3.Transaction.from(decodedTransaction);

    return tx;
};
