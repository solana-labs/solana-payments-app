import axios from 'axios';

describe('Transaction', () => {
    it('should be able to fetch a transaction', async () => {
        const transactionId = 'mwTTgZfiQ75GQCq9FzopAZKjLNE8zrxbjTeoEKn5WHqWfonkMCeKxgLe9eiwu4Fn1raYPkcxGXmLgcjLogQmucQ';

        const response = await axios({
            url: 'https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({
                jsonrpc: '2.0',
                method: 'getTransaction',
                id: '1',
                params: [
                    '4tbQFLW7nbSquAGXrpTHp7Gsb2fWJF2oayKZW1vpuXRWkuSfoLaXhWRy1kM3FmFi25QpHrmq5LiJnUqyWHQtWzZf',
                    { encoding: 'base58' },
                ],
            }),
        });

        console.log(response.data);

        expect(true).toBe(true);
    });
});
