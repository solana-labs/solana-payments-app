import { getPubkeyType } from '../../src/services/helius.service.js';

describe('Wallet', () => {
    it('should create a wallet', async () => {
        process.env.HELIUS_API_KEY = '8d86570e-4519-4cc9-b90c-a6d0e02c5b2c';

        const account = '5rPoLqhSC2VnMULYfzYX4712GEFNFv8nof6K6nP7GX8E';
        const pubkeyType = await getPubkeyType(account);
        console.log(pubkeyType);

        expect(true).toBe(true);
    });
});
