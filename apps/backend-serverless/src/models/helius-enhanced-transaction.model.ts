import { object, string, InferType, number, array } from 'yup'
import { parseAndValidate } from '../utilities/yup.utility.js'
export const heliusRawTokenAmountSchema = object().shape({
    tokenAmount: string().required(),
    decimals: number().required(),
})

export const heliusNftSchema = object().shape({
    mint: string().required(),
    tokenStandard: string().required(),
})

export const heliusNftEventSchema = object().shape({
    description: string().required(),
    type: string().required(),
    source: string().required(),
    amount: number().required(),
    fee: number().required(),
    feePayer: string().required(),
    signature: string().required(),
    slot: number().required(),
    timestamp: number().required(),
    saleType: string().required(),
    buyer: string().required(),
    seller: string().required(),
    staker: string().required(),
    nfts: array().of(heliusNftSchema).required(),
})

export const heliusSwapTokenOutputSchema = object().shape({
    account: string().required(),
    amount: string().required(),
})

export const heliusSwapTokenInputSchema = object().shape({
    userAccount: string().required(),
    tokenAccount: string().required(),
    mint: string().required(),
    rawTokenAmount: heliusRawTokenAmountSchema.required(),
})

export const heliusSwapNativeOutputSchema = object().shape({
    account: string().required(),
    amount: string().required(),
})

export const heliusSwapNativeInputSchema = object().shape({
    account: string().required(),
    amount: string().required(),
})

export const heliusSwapEventSchema = object().shape({
    nativeInput: heliusSwapNativeInputSchema.required(),
    nativeOutput: heliusSwapNativeOutputSchema.required(),
    tokenInputs: string().required(),
    tokenOutputs: string().required(),
    tokenFees: string().required(),
    nativeFees: string().required(),
    innerSwaps: string().required(),
})

export const heliusEventsSchema = object().shape({
    nft: array().of(string()).required(),
    swap: string().required(),
})

export const heliusInnerInstructionSchema = object().shape({
    accounts: array().of(string()).required(),
    data: string().required(),
    programId: string().required(),
})

export const heliusInstructionSchema = object().shape({
    accounts: array().of(string()).required(),
    data: string().required(),
    programId: string().required(),
    innerInstructions: array().of(heliusInnerInstructionSchema).required(),
})

export const heliusTransactionErrorSchema = object()
    .shape({
        error: string().required(),
    })
    .nullable()

export const heliusTokenBalanceChangeSchema = object().shape({
    userAccount: string().required(),
    tokenAccount: string().required(),
    mint: string().required(),
    rawTokenAmount: heliusRawTokenAmountSchema.required(),
})

export const heliusAccountTransferSchema = object().shape({
    account: string().required(),
    nativeBalanceChange: number().required(),
    tokenBalanceChanges: array().of(heliusTokenBalanceChangeSchema).required(),
})

export const heliusTokenTransferSchema = object().shape({
    fromUserAccount: string().required(),
    toUserAccount: string().required(),
    fromTokenAccount: string().required(),
    toTokenAccount: string().required(),
    tokenAmount: number().required(),
    mint: string().required(),
})

export const heliusNativeTransferSchema = object().shape({
    fromUserAccount: string().required(),
    toUserAccount: string().required(),
    amount: number().required(),
})

export const heliusEnhancedTransactionModelSchema = object().shape({
    description: string().required(),
    type: string().required(),
    source: string().required(),
    fee: string().required(),
    feePayer: string().required(),
    signature: string().required(),
    slot: number().required(),
    timestamp: number().required(),
    nativeTransfers: array().of(heliusNativeTransferSchema).required(),
    tokenTransfers: array().of(heliusTokenTransferSchema).required(),
    accountData: array().of(heliusAccountTransferSchema).required(),
    transactionError: heliusTransactionErrorSchema.optional(),
    instructions: array().of(heliusInstructionSchema).required(),
})

export const heliusEnhancedTransactionResponseSchema = array()
    .of(heliusEnhancedTransactionModelSchema)
    .required()

export type HeliusEnhancedTransaction = InferType<
    typeof heliusEnhancedTransactionModelSchema
>

export type HeliusEnhancedTransactionArray = InferType<
    typeof heliusEnhancedTransactionResponseSchema
>

export const parseAndValidateHeliusEnchancedTransaction = (
    heliusEnhancedTransactionResponseBody: unknown
): HeliusEnhancedTransactionArray => {
    return parseAndValidate(
        heliusEnhancedTransactionResponseBody,
        heliusEnhancedTransactionResponseSchema,
        'Could not parse the heluis enhanced transaction body. Unknown Reason.'
    )
}
