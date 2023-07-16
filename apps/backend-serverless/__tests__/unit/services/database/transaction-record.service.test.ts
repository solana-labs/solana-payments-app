import { TransactionType } from '@prisma/client';
import { prismaMock } from '../../../../prisma-singleton.js';
import { TransactionRecordService } from '../../../../src/services/database/transaction-record-service.database.service.js';

describe('Transaction Record Testing Suite', () => {
    let transactionRecordService: TransactionRecordService;

    beforeEach(() => {
        transactionRecordService = new TransactionRecordService(prismaMock);
    });

    it('find a transaction record', async () => {
        const mockTransactionRecord = {
            id: 1,
            signature: '1234',
            type: TransactionType.payment,
            createdAt: new Date(),
            paymentRecordId: 'abcd',
            refundRecordId: null,
        };

        prismaMock.transactionRecord.findFirst.mockResolvedValue(mockTransactionRecord);

        const transactionRecord = await transactionRecordService.getTransactionRecord({
            signature: '1234',
        });

        expect(transactionRecord).toEqual(mockTransactionRecord);
    });

    it('create a transaction record for payment', async () => {
        const mockTransactionRecord = {
            id: 1,
            signature: '1234',
            type: TransactionType.payment,
            createdAt: new Date(),
            paymentRecordId: 'abcd',
            refundRecordId: null,
        };

        prismaMock.transactionRecord.create.mockResolvedValue(mockTransactionRecord);

        const transactionRecord = await transactionRecordService.createTransactionRecord(
            '1234',
            TransactionType.payment,
            'abcd',
            null,
        );

        expect(transactionRecord).toEqual(mockTransactionRecord);
    });

    it('create a transaction record for refund', async () => {
        const mockTransactionRecord = {
            id: 1,
            signature: 'abcd',
            type: TransactionType.refund,
            createdAt: new Date(),
            paymentRecordId: null,
            refundRecordId: 'abcd',
        };

        prismaMock.transactionRecord.create.mockResolvedValue(mockTransactionRecord);

        const transactionRecord = await transactionRecordService.createTransactionRecord(
            '1234',
            TransactionType.refund,
            null,
            'abcd',
        );

        expect(transactionRecord).toEqual(mockTransactionRecord);
    });
});
