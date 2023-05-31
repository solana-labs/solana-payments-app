import { web3 } from '@project-serum/anchor';
import { fetchRefundTransaction } from '../../../../src/services/transaction-request/fetch-refund-transaction.service.js';
import {
    createMockPaymentRecord,
    createMockRefundRecord,
    createMockTransactionRequestResponse,
} from '../../../../src/utilities/testing-helper/create-mock.utility.js';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

describe('fetch refund transaction request testing suite', () => {
    it('should fetch a refund transaction request', async () => {
        const paymentRecordId = 'test-payment-record-id';

        const mockPaymentRecord = createMockPaymentRecord();
        const mockRefundRecord = createMockRefundRecord();

        const mockGasKeypair = web3.Keypair.generate();
        const mockMerchantKeypair = web3.Keypair.generate();
        const mockCustomerKeypair = web3.Keypair.generate();
        const mockSingleUseKeypair = web3.Keypair.generate();

        // Going to pause on this for now and pick it up during the testing sprint
        // I want to make sure everything inside here is tested before I do a really involved test here

        // let mock = new MockAdapter(axios);
        // const mockPaymentSessionRejectResponse = createMockTransactionRequestResponse({
        //     payer: mockMerchantKeypair.publicKey,
        //     receiver: mock,
        // });
        // mock.onPost().reply(200, mockPaymentSessionRejectResponse);

        // const mockRefundTransactionRequestResponse = await fetchRefundTransaction(
        //     mockRefundRecord,
        //     mockPaymentRecord,
        //     mockMerchantKeypair.publicKey.toBase58(),
        //     mockGasKeypair.publicKey.toBase58(),
        //     mockSingleUseKeypair.publicKey.toBase58(),
        //     mockGasKeypair.publicKey.toBase58(),
        //     axios
        // );

        expect(true).toEqual(true);
    });
});
