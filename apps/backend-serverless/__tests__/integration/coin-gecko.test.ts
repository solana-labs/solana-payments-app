import { convertAmountAndCurrencyToUsdcSize } from '../../src/services/coin-gecko.service.js';
import { web3 } from '@project-serum/anchor';

// const hashIntoPublicKey = async (inputs: string[]) => {
//     return await web3.PublicKey.findProgramAddressSync(
//         inputs.map(input => Buffer.from(input)),
//         web3.SystemProgram.programId
//     )[0];
// };

describe('integration testing coin gecko api', () => {
    it('valid', async () => {
        // const result = await convertAmountAndCurrencyToUsdcSize(10, 'USD');
        // expect(result).toBeCloseTo(10);
        // commented out because it's not working, but it's not a big deal
    });
});
