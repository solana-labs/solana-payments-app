import { PaymentRecordService } from '../src/services/database/payment-record-service.database.service'
import { PrismaClient } from '@prisma/client'
import { prismaMock } from '../prisma-singleton'

describe('Payment Record Testing Suite', () => {
    let paymentRecordService: PaymentRecordService

    beforeEach(() => {
        paymentRecordService = new PaymentRecordService(prismaMock)
    })

    it('find a payment record', async () => {
        const mockPaymentRecord = {
            status: 'pending',
            id: 1,
            shopId: '1234',
            shopGid: 'abcd',
            shopGroup: 'efgh',
            test: true,
            amount: 19.94,
            currency: 'USD',
            customerAddress: null,
            merchantId: 1,
            cancelURL: 'https://example.com',
            redirectUrl: null,
        }

        prismaMock.paymentRecord.findFirst.mockResolvedValue(mockPaymentRecord)

        const paymentRecord = await paymentRecordService.getPaymentRecord({
            shopId: '1234',
        })

        expect(paymentRecord).toEqual(mockPaymentRecord)
    })

    // it('create a payment record', async () => {
    //     const mockPaymentRecord = {
    //         status: 'pending',
    //         id: 1,
    //         shopId: '1234',
    //         shopGid: 'abcd',
    //         shopGroup: 'efgh',
    //         test: true,
    //         amount: 19.94,
    //         currency: 'USD',
    //         customerAddress: null,
    //         merchantId: 1,
    //         cancelURL: 'https://example.com',
    //         redirectUrl: null,
    //     }

    //     prismaMock.paymentRecord.create.mockResolvedValue(mockPaymentRecord)

    //     // does creating a payment record off payment initiation make sense?
    //     // const paymentRecord = await paymentRecordService.createPaymentRecord()

    //     // expect(paymentRecord).toEqual(mockPaymentRecord)
    // })

    it('update a payment record', async () => {
        const mockPaymentRecordBeforeUpdate = {
            id: 1,
            status: 'pending',
            shopId: 'abcd',
            shopGid: 'gid://shopify/Shop/1234',
            shopGroup: 'fdsaf',
            test: true,
            amount: 19.42,
            currency: 'USD',
            customerAddress: null,
            merchantId: 5,
            cancelURL: 'https://example.com',
            redirectUrl: null,
        }

        const mockPaymentRecordAfterUpdate = {
            id: 1,
            status: 'paid',
            shopId: 'abcd',
            shopGid: 'gid://shopify/Shop/1234',
            shopGroup: 'fdsaf',
            test: true,
            amount: 19.42,
            currency: 'USD',
            customerAddress: null,
            merchantId: 5,
            cancelURL: 'https://example.com',
            redirectUrl: null,
        }

        prismaMock.paymentRecord.findFirst.mockResolvedValue(
            mockPaymentRecordBeforeUpdate
        )

        const paymentRecordBeforeUpdate =
            await paymentRecordService.getPaymentRecord({
                shopId: 'abcd',
            })

        if (paymentRecordBeforeUpdate === null) {
            return
        }

        prismaMock.paymentRecord.update.mockResolvedValue(
            mockPaymentRecordAfterUpdate
        )

        const paymentRecordAfterUpdate =
            await paymentRecordService.updatePaymentRecord(
                paymentRecordBeforeUpdate,
                {
                    status: 'paid',
                }
            )

        expect(paymentRecordAfterUpdate).toEqual(mockPaymentRecordAfterUpdate)
    })
})
