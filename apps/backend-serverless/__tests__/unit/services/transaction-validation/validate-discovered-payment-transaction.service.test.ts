import { verifyTransferInstructionIsCorrect } from '../../../../src/services/transaction-validation/validate-discovered-payment-transaction.service.js';
import { PaymentRecord, PaymentRecordStatus } from '@prisma/client';
import { web3 } from '@project-serum/anchor';

describe('unit testing validating discovered payment transactions', () => {
    beforeEach(() => {});

    it('a', async () => {
        // id: string
        // status: PaymentRecordStatus
        // shopId: string
        // shopGid: string | null
        // shopGroup: string
        // test: boolean
        // amount: number
        // currency: string
        // usdcAmount: number
        // cancelURL: string
        // merchantId: string
        // transactionSignature: string | null
        // redirectUrl: string | null
        // requestedAt: Date
        // completedAt: Date | null

        const mockPaymentRecord: PaymentRecord = {
            id: 'a',
            status: PaymentRecordStatus.pending,
            shopId: 'mock-shop-id',
            shopGid: 'mock-shop-gid',
            shopGroup: 'mock-shop-group',
            test: false,
            amount: 100,
            currency: 'USD',
            usdcAmount: 100,
            cancelURL: 'mock-cancel-url',
            merchantId: 'mock-merchant-id',
            transactionSignature: 'mock-transaction-signature',
            redirectUrl: 'mock-redirect-url',
            requestedAt: new Date(),
            completedAt: new Date(),
        };

        var mockTransaction = new web3.Transaction();
        const mockTransferInstruction = mockTransaction.add();
    });
});
