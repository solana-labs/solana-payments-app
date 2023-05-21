import { RefundRecordService } from '../../../src/services/database/refund-record-service.database.service.js';
import { prismaMock } from '../../../prisma-singleton.js';

describe('Refund Record Testing Suite', () => {
    let refundRecordService: RefundRecordService;

    beforeEach(() => {
        refundRecordService = new RefundRecordService(prismaMock);
    });

    it('find a refund record', async () => {
        const mockRefundRecord = {
            status: 'pending',
            id: 'abcd',
            amount: 19.94,
            usdcAmount: 19.94,
            currency: 'USD',
            shopId: '1234',
            shopGid: 'abcd',
            shopPaymentId: 'efgh',
            test: true,
            merchantId: 'qwer',
            transactionSignature: null,
            requestedAt: new Date(),
            completedAt: null,
        };

        prismaMock.refundRecord.findFirst.mockResolvedValue(mockRefundRecord);

        const refundRecord = await refundRecordService.getRefundRecord({
            id: 'abcd',
        });

        expect(refundRecord).toEqual(mockRefundRecord);
    });
});
