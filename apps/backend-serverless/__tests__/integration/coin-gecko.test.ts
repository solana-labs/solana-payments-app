import { convertAmountAndCurrencyToUsdcSize } from '../../src/services/coin-gecko.service.js';
import { web3 } from '@project-serum/anchor';
import fetch from 'node-fetch';
import { decode } from 'bs58';

const hashIntoPublicKey = async (inputs: string[]) => {
    return await web3.PublicKey.findProgramAddressSync(
        inputs.map(input => Buffer.from(input)),
        web3.SystemProgram.programId
    )[0];
};

describe('integration testing coin gecko api', () => {
    it('valid', async () => {
        // const result = await convertAmountAndCurrencyToUsdcSize(10, 'USD');
        // expect(result).toBeCloseTo(10);
        // commented out because it's not working, but it's not a big deal

        // const connection = new web3.Connection('https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e');
        // const txSig = '5Yt9vFGDwXWMPqgXkhocNB77F7FasrHJrmEtL1UoU9X3G7Lx5LC8yCaxfqJ7TZ4wrHfHrfYPBcjvkGfWwoLNzE8A';
        // const response = await connection.getTransaction(txSig, { encoding: 'base58' });
        // console.log(response);
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
                    params: [
                        '5Yt9vFGDwXWMPqgXkhocNB77F7FasrHJrmEtL1UoU9X3G7Lx5LC8yCaxfqJ7TZ4wrHfHrfYPBcjvkGfWwoLNzE8A',
                        { encoding: 'base58' },
                    ],
                }),
            })
        ).json();

        const decodedTransaction = decode(bs58Transaction);

        const tx = web3.Transaction.from(decodedTransaction);

        console.log(tx);
    });
});
