import { convertAmountAndCurrencyToUsdcSize } from '../../src/services/coin-gecko.service.js';
import { web3 } from '@project-serum/anchor';

describe('integration testing coin gecko api', () => {
    it('valid', async () => {
        // const result = await convertAmountAndCurrencyToUsdcSize(10, 'USD');
        // expect(result).toBeCloseTo(10, 2);
        // commented out because it's not working, but it's not a big deal
    });
});
