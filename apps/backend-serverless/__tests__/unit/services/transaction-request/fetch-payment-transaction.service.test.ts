import * as web3 from '@solana/web3.js';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { fetchPaymentTransaction } from '../../../../src/services/transaction-request/fetch-payment-transaction.service.js';
import {
    createMockMerchant,
    createMockPaymentRecord,
    createMockTransactionRequestResponse,
} from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('fetch payment transaction request testing suite', () => {
    it('should fetch a payment transaction request', async () => {
        process.env.TRANSACTION_REQUEST_SERVER_URL = 'https://transaction-request-server.com';

        const mockMerchantKeypair = web3.Keypair.generate();
        const mockMerchant = createMockMerchant({ walletAddress: mockMerchantKeypair.publicKey.toBase58() });
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
            axios,
        );

        expect(true).toEqual(true);
    });
});
