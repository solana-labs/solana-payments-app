import { PaymentRecord } from '@prisma/client'
import { HeliusEnhancedTransaction } from '../models/helius-enhanced-transaction.model.js'
import { USDC_MINT } from '../configs/tokens.config.js'

export const getCustomerFromHeliusEnhancedTransaction = (
    transaction: HeliusEnhancedTransaction,
    paymentRecord: PaymentRecord
) => {
    const tokenTransfers = transaction.tokenTransfers

    // for our current purposes, this might be sufficient
    for (const tokenTransfer of tokenTransfers) {
        if (tokenTransfer.mint == USDC_MINT.toBase58()) {
            return tokenTransfer.fromUserAccount
        }
    }

    throw new Error('Could not find customer from transaction.')
}
