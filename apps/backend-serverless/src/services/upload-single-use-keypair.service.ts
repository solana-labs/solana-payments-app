import { PaymentRecord } from '@prisma/client'
import { web3 } from '@project-serum/anchor'

export const uploadSingleUseKeypair = async (
    singleUseKeypair: web3.Keypair,
    paymentRecord: PaymentRecord
) => {
    singleUseKeypair
    paymentRecord
}
