import { convertAmountAndCurrencyToUsdcSize } from '../../src/services/coin-gecko.service.js';
describe('integration testing coin gecko api', () => {
    it('valid', async () => {
        const result = await convertAmountAndCurrencyToUsdcSize(10, 'USD');
        expect(result).toBeCloseTo(10);
    });
});
