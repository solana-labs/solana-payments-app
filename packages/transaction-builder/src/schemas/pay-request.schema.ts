import { z } from 'zod'
import { pubkeyOrThrow } from '../utils/pubkey.util'

export const AmountType = {
    Size: 'size',
    Quantity: 'quantity',
} as const

const AmountTypeEnum = z.nativeEnum(AmountType)
export type AmountTypeEnum = z.infer<typeof AmountTypeEnum>

export const TransactionType = {
    Blockhash: 'blockhash',
    Nonce: 'nonce',
} as const

const TransactionTypeEnum = z.nativeEnum(TransactionType)
export type TransactionTypeEnum = z.infer<typeof TransactionTypeEnum>

export const PayRequest = z.object({
    receiver: z.string().transform(pubkeyOrThrow),
    sender: z.string().transform(pubkeyOrThrow),
    sendingToken: z.string().transform(pubkeyOrThrow),
    receivingToken: z.string().transform(pubkeyOrThrow),
    feePayer: z.string().transform(pubkeyOrThrow),
    receivingAmount: z.number().nonnegative(),
    amountType: AmountTypeEnum,
    transactionType: TransactionTypeEnum,
    createAta: z.boolean().default(true),
})

export type PayRequest = z.infer<typeof PayRequest>

function optionallyAddInt<T extends z.ZodNumber>(
    schema: T,
    amountType: AmountTypeEnum
) {
    return amountType == 'size' ? schema.int() : schema
}
