import { convertAmountAndCurrencyToUsdcSize } from '../../src/services/coin-gecko.service.js';

describe('Coin', () => {
    it('should be able to create a new coin', async () => {
        process.env.COIN_GECKO_API_KEY = 'CG-UJATSg1B9iNjfpduQ9giBvP1';
        const usdcSize = await convertAmountAndCurrencyToUsdcSize(100, 'USD');
        console.log(usdcSize);
        expect(true).toBe(true);
    });
});
