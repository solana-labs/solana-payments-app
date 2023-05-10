import { TransactionRecordService } from '../src/services/database/transaction-record-service.database.service'
import { TransactionType } from '@prisma/client'
import { prismaMock } from '../prisma-singleton'

describe('Transaction Record Testing Suite', () => {
    let transactionRecordService: TransactionRecordService

    beforeEach(() => {
        transactionRecordService = new TransactionRecordService(prismaMock)
    })

    it('find a transaction record', async () => {
        const mockTransactionRecord = {
            id: 1,
            signature: '1234',
            type: TransactionType.payment,
            createdAt: 'fake-date',
            paymentRecordId: 1,
            refundRecordId: null,
        }

        prismaMock.transactionRecord.findFirst.mockResolvedValue(
            mockTransactionRecord
        )

        const transactionRecord =
            await transactionRecordService.getTransactionRecord('1234')

        expect(transactionRecord).toEqual(mockTransactionRecord)
    })

    it('create a transaction record for payment', async () => {
        const mockTransactionRecord = {
            id: 1,
            signature: '1234',
            type: TransactionType.payment,
            createdAt: 'fake-date',
            paymentRecordId: 1,
            refundRecordId: null,
        }

        prismaMock.transactionRecord.create.mockResolvedValue(
            mockTransactionRecord
        )

        const transactionRecord =
            await transactionRecordService.createTransactionRecord(
                '1234',
                TransactionType.payment,
                1,
                null,
                'fake-date'
            )

        expect(transactionRecord).toEqual(mockTransactionRecord)
    })

    it('create a transaction record for refund', async () => {
        const mockTransactionRecord = {
            id: 1,
            signature: 'abcd',
            type: TransactionType.refund,
            createdAt: 'fake-date',
            paymentRecordId: null,
            refundRecordId: 2,
        }

        prismaMock.transactionRecord.create.mockResolvedValue(
            mockTransactionRecord
        )

        const transactionRecord =
            await transactionRecordService.createTransactionRecord(
                '1234',
                TransactionType.refund,
                null,
                2,
                'fake-date'
            )

        expect(transactionRecord).toEqual(mockTransactionRecord)
    })
})
