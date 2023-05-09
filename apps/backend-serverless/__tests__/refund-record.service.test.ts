import { RefundRecordService } from '../src/services/database/refund-record-service.database.service'
import { prismaMock } from '../prisma-singleton'

describe('Refund Record Testing Suite', () => {
    let refundRecordService: RefundRecordService

    beforeEach(() => {
        refundRecordService = new RefundRecordService(prismaMock)
    })

    it('find a refund record', async () => {
        const mockRefundRecord = {
            status: 'pending',
            id: 1,
            amount: 19.94,
            currency: 'USD',
            shopId: '1234',
            shopGid: 'abcd',
            shopPaymentId: 'efgh',
            test: true,
            merchantId: 1,
        }

        prismaMock.refundRecord.findFirst.mockResolvedValue(mockRefundRecord)

        const refundRecord = await refundRecordService.getRefundRecord(1)

        expect(refundRecord).toEqual(mockRefundRecord)
    })
})
