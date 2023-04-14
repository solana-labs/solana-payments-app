import { prisma } from '../../..'
import { PaymentRecord } from '@prisma/client'

const createPaymentRecord = async (shop: string) => {
    const shopifyAcess = await prisma.paymentRecord.create({
        data: {
            signature: 'abc',
            completed: false,
        },
    })
}

const addSignatureToPaymentRecord = async (
    paymentRecord: string,
    signature: string
) => {
    const shopifyAcess = await prisma.paymentRecord.create({
        data: {
            signature: 'abc',
            completed: false,
        },
    })
}
