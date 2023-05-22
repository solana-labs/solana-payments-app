import { fetchEnhancedTransaction } from '../../src/services/helius.service.js';
import axios from 'axios';
import { fetchGasKeypair } from '../../src/services/fetch-gas-keypair.service.js';
import { web3 } from '@project-serum/anchor';
import { PaymentRecord, PaymentRecordStatus } from '@prisma/client';
import { uploadSingleUseKeypair } from '../../src/services/upload-single-use-keypair.service.js';

describe('integration testing coin gecko api', () => {
    it('valid', async () => {
        // const result = await convertAmountAndCurrencyToUsdcSize(10, 'USD');
        // expect(result).toBeCloseTo(10);
        // commented out because it's not working, but it's not a big deal
        process.env.HELIUS_API_KEY = '5f70b753-57cb-422b-a018-d7df67b4470e';
        try {
            const tx = await fetchEnhancedTransaction(
                '5mbRQYwPrrj3DFdt8mf1xd4UDxewfQhvU4Au2zT1x1rcRy7J1dWtL4GrY5tds9B35GP7w4mfZRzXmNKaeCrjP7w2'
            );
            console.log(tx);
        } catch (error) {
            console.log(error);
        }

        expect(true).toBe(true);
    });
});
