import { object, string, InferType, number, array } from 'yup'

export let heliusRawTokenAmountSchema = object().shape({
    tokenAmount: string().required(),
    decimals: number().required(),
})

export let heliusNftSchema = object().shape({
    mint: string().required(),
    tokenStandard: string().required(),
})

export let heliusNftEventSchema = object().shape({
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

export let heliusSwapTokenOutputSchema = object().shape({
    account: string().required(),
    amount: string().required(),
})

export let heliusSwapTokenInputSchema = object().shape({
    userAccount: string().required(),
    tokenAccount: string().required(),
    mint: string().required(),
    rawTokenAmount: heliusRawTokenAmountSchema.required(),
})

export let heliusSwapNativeOutputSchema = object().shape({
    account: string().required(),
    amount: string().required(),
})

export let heliusSwapNativeInputSchema = object().shape({
    account: string().required(),
    amount: string().required(),
})

export let heliusSwapEventSchema = object().shape({
    nativeInput: heliusSwapNativeInputSchema.required(),
    nativeOutput: heliusSwapNativeOutputSchema.required(),
    tokenInputs: string().required(),
    tokenOutputs: string().required(),
    tokenFees: string().required(),
    nativeFees: string().required(),
    innerSwaps: string().required(),
})

export let heliusEventsSchema = object().shape({
    nft: array().of(string()).required(),
    swap: string().required(),
})

export let heliusInnerInstructionSchema = object().shape({
    accounts: array().of(string()).required(),
    data: string().required(),
    programId: string().required(),
})

export let heliusInstructionSchema = object().shape({
    accounts: array().of(string()).required(),
    data: string().required(),
    programId: string().required(),
    innerInstructions: array().of(heliusInnerInstructionSchema).required(),
})

export let heliusTransactionErrorSchema = object().shape({
    error: string().required(),
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
    nativeTransfers: array().of(heliusNativeTransferSchema).required(),
    tokenTransfers: array().of(heliusTokenTransferSchema).required(),
    accountData: array().of(heliusAccountTransferSchema).required(),
    transactionError: heliusTransactionErrorSchema.required(),
    instructions: array().of(heliusInstructionSchema).required(),
})

export interface HeliusEnhancedTransaction
    extends InferType<typeof heliusEnhancedTransactionModelSchema> {}
