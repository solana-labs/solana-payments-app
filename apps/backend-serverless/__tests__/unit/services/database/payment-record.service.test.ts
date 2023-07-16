import { PaymentRecordStatus } from '@prisma/client';
import { prismaMock } from '../../../../prisma-singleton.js';
import { PaymentRecordService } from '../../../../src/services/database/payment-record-service.database.service.js';
import { createMockPaymentRecord } from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('Payment Record Testing Suite', () => {
    let paymentRecordService: PaymentRecordService;

    beforeEach(() => {
        paymentRecordService = new PaymentRecordService(prismaMock);
    });

    it('find a payment record', async () => {
        const mockPaymentRecord = createMockPaymentRecord({ id: 'abcd' });

        prismaMock.paymentRecord.findFirst.mockResolvedValue(mockPaymentRecord);

        const paymentRecord = await paymentRecordService.getPaymentRecord({
            id: 'abcd',
        });

        expect(paymentRecord).toEqual(mockPaymentRecord);
    });

    it('update a payment record', async () => {
        const mockPaymentRecordBeforeUpdate = createMockPaymentRecord({ id: 'abcd' });
        const mockPaymentRecordAfterUpdate = createMockPaymentRecord({
            id: 'abcd',
            status: PaymentRecordStatus.completed,
            redirectUrl: 'https://example.com',
            completedAt: new Date(),
        });

        prismaMock.paymentRecord.findFirst.mockResolvedValue(mockPaymentRecordBeforeUpdate);
        prismaMock.paymentRecord.update.mockResolvedValue(mockPaymentRecordAfterUpdate);

        const paymentRecordAfterUpdate = await paymentRecordService.updatePaymentRecord(mockPaymentRecordBeforeUpdate, {
            status: PaymentRecordStatus.completed,
            redirectUrl: 'https://example.com',
            completedAt: new Date(),
        });

        expect(paymentRecordAfterUpdate).toEqual(mockPaymentRecordAfterUpdate);
    });
});
