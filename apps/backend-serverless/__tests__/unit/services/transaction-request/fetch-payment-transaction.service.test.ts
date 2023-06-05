import { web3 } from '@project-serum/anchor';
import {
    createMockMerchant,
    createMockPaymentRecord,
    createMockTransactionRequestResponse,
} from '../../../../src/utilities/testing-helper/create-mock.utility.js';
import { fetchPaymentTransaction } from '../../../../src/services/transaction-request/fetch-payment-transaction.service.js';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

describe('fetch payment transaction request testing suite', () => {
    it('should fetch a payment transaction request', async () => {
        const mockMerchantKeypair = web3.Keypair.generate();
        const mockMerchant = createMockMerchant({ paymentAddress: mockMerchantKeypair.publicKey.toBase58() });
        const mockPaymentRecord = createMockPaymentRecord({ merchantId: mockMerchant.id });

        const mockGasKeypair = web3.Keypair.generate();
        const mockCustomerKeypair = web3.Keypair.generate();
        const mockSingleUseKeypair = web3.Keypair.generate();

        const mock = new MockAdapter(axios);
        const mockTransactionResponseResponse = await createMockTransactionRequestResponse({
            payer: mockCustomerKeypair.publicKey,
            receiver: mockMerchantKeypair.publicKey,
        });
        mock.onPost().reply(200, mockTransactionResponseResponse);

        await fetchPaymentTransaction(
            mockPaymentRecord,
            mockMerchant,
            mockCustomerKeypair.publicKey.toBase58(),
            mockGasKeypair.publicKey.toBase58(),
            mockSingleUseKeypair.publicKey.toBase58(),
            mockGasKeypair.publicKey.toBase58(),
            axios
        );

        expect(true).toEqual(true);
    });
});
