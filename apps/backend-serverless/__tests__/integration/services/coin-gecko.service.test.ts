import axios from 'axios';

import { convertAmountAndCurrencyToUsdcSize } from '../../../src/services/coin-gecko.service.js';

describe('convertAmountAndCurrencyToUsdcSize Integration Test', () => {
    process.env.COIN_GECKO_API_KEY = 'coin-gecko-api-key';
    it('should convert the given amount to USDC', async () => {
        const amount = 29.5;
        const currency = 'USD';

        const result = await convertAmountAndCurrencyToUsdcSize(amount, currency, axios);

        // You can add more specific checks here if you know what the exact expected result should be
        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThan(0);
    });
});
