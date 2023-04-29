import { object, string, InferType, number } from 'yup'

export let heliusInstructionSchema = object().shape({
    accounts: string().required(),
})

export let heliusTransactionErrorSchema = object().shape({
    error: string().required(),
})

export let heliusRawTokenAmountSchema = object().shape({
    tokenAmount: string().required(),
    decimals: number().required(),
})

export let heliusTokenBalanceChangeSchema = object().shape({
    userAccount: string().required(),
    tokenAccount: number().required(),
    mint: string().required(),
    rawTokenAmount: heliusRawTokenAmountSchema.required(),
})

export let heliusAccountTransferSchema = object().shape({
    account: string().required(),
    nativeBalanceChange: number().required(),
    tokenBalanceChange: string().required(),
    toTokenAccount: string().required(),
    tokenAmount: number().required(),
    mint: string().required()
})

export let heliusTokenTransferSchema = object().shape({
    fromUserAccount: string().required(),
    toUserAccount: string().required(),
    fromTokenAccount: string().required(),
    toTokenAccount: string().required(),
    tokenAmount: number().required(),
    mint: string().required()
})

export let heliusNativeTransferSchema = object().shape({
    fromUserAccount: string().required(),
    toUserAccount: string().required(),
    amount: number().required(),
})

export let heliusEnhancedTransactionModelSchema = object().shape({
    description: string().required(),
    type: string().required(),
    source: string().required(),
    fee: string().required(),
    feePayer: string().required(),
    signature: string().required(),
    slot: number().required(),
    timestamp: number().required(),
    nativeTransfers: 
})

export interface HeliusEnhancedTransaction
    extends InferType<typeof heliusEnhancedTransactionModelSchema> {}
