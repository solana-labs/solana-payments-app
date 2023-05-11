import { PaymentRecord } from '@prisma/client'
import { web3 } from '@project-serum/anchor'

export const generateSingleUseKeypairFromPaymentRecord = async (
    paymentRecord: PaymentRecord
) => {
    const shopifyStrings = ['shopify', paymentRecord.shopId]
    const buffer = Buffer.from(shopifyStrings.join(':'))
    const seed: Uint8Array = Uint8Array.from(buffer)
    const keypair = web3.Keypair.fromSeed(seed)
    return keypair
}
