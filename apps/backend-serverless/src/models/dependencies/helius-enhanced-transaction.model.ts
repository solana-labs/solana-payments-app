import { InferType, array, number, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';
export const heliusRawTokenAmountSchema = object().shape({
    tokenAmount: string().optional(),
    decimals: number().optional(),
});

export const heliusNftSchema = object().shape({
    mint: string().optional(),
    tokenStandard: string().optional(),
});

export const heliusNftEventSchema = object().shape({
    description: string().optional(),
    type: string().optional(),
    source: string().optional(),
    amount: number().optional(),
    fee: number().optional(),
    feePayer: string().optional(),
    signature: string().optional(),
    slot: number().optional(),
    timestamp: number().optional(),
    saleType: string().optional(),
    buyer: string().optional(),
    seller: string().optional(),
    staker: string().optional(),
    nfts: array().of(heliusNftSchema).optional(),
});

export const heliusSwapTokenOutputSchema = object().shape({
    account: string().optional(),
    amount: string().optional(),
});

export const heliusSwapTokenInputSchema = object().shape({
    userAccount: string().optional(),
    tokenAccount: string().optional(),
    mint: string().optional(),
    rawTokenAmount: heliusRawTokenAmountSchema.optional(),
});

export const heliusSwapNativeOutputSchema = object().shape({
    account: string().optional(),
    amount: string().optional(),
});

export const heliusSwapNativeInputSchema = object().shape({
    account: string().optional(),
    amount: string().optional(),
});

export const heliusSwapEventSchema = object().shape({
    nativeInput: heliusSwapNativeInputSchema.optional(),
    nativeOutput: heliusSwapNativeOutputSchema.optional(),
    tokenInputs: string().optional(),
    tokenOutputs: string().optional(),
    tokenFees: string().optional(),
    nativeFees: string().optional(),
    innerSwaps: string().optional(),
});

export const heliusEventsSchema = object().shape({
    nft: array().of(string()).optional(),
    swap: string().optional(),
});

export const heliusInnerInstructionSchema = object().shape({
    accounts: array().of(string()).optional(),
    data: string().optional(),
    programId: string().optional(),
});

export const heliusInstructionSchema = object().shape({
    accounts: array().of(string()).optional(),
    data: string().optional(),
    programId: string().optional(),
    innerInstructions: array().of(heliusInnerInstructionSchema).optional(),
});

export const heliusTransactionErrorSchema = object()
    .shape({
        error: string().optional(),
    })
    .nullable();

export const heliusTokenBalanceChangeSchema = object().shape({
    mint: string().optional(),
    rawTokenAmount: heliusRawTokenAmountSchema.optional(),
    tokenAccount: string().optional(),
    userAccount: string().optional(),
});

export const heliusAccountTransferSchema = object().shape({
    account: string().optional(),
    nativeBalanceChange: number().optional(),
    tokenBalanceChanges: array().of(heliusTokenBalanceChangeSchema).optional(),
});

export const heliusTokenTransferSchema = object().shape({
    fromUserAccount: string().optional(),
    toUserAccount: string().optional(),
    fromTokenAccount: string().optional(),
    toTokenAccount: string().optional(),
    tokenAmount: number().optional(),
    mint: string().optional(),
    tokenStandard: string().optional(),
});

export const heliusNativeTransferSchema = object().shape({
    fromUserAccount: string().optional(),
    toUserAccount: string().optional(),
    amount: number().optional(),
});

export const heliusEnhancedTransactionModelSchema = object().shape({
    description: string().optional(),
    type: string().optional(),
    source: string().optional(),
    fee: number().optional(),
    feePayer: string().optional(),
    signature: string().required(),
    slot: number().optional(),
    timestamp: number().optional(),
    nativeTransfers: array().of(heliusNativeTransferSchema).optional(),
    tokenTransfers: array().of(heliusTokenTransferSchema).optional(),
    accountData: array().of(heliusAccountTransferSchema).optional(),
    transactionError: heliusTransactionErrorSchema.optional(),
    instructions: array().of(heliusInstructionSchema).optional(),
});

export const heliusEnhancedTransactionResponseSchema = array().of(heliusEnhancedTransactionModelSchema).required();

export type HeliusEnhancedTransaction = InferType<typeof heliusEnhancedTransactionModelSchema>;

export type HeliusEnhancedTransactionArray = InferType<typeof heliusEnhancedTransactionResponseSchema>;

export const parseAndValidateHeliusEnchancedTransaction = (
    heliusEnhancedTransactionResponseBody: unknown
): HeliusEnhancedTransactionArray => {
    return parseAndValidateStrict(
        heliusEnhancedTransactionResponseBody,
        heliusEnhancedTransactionResponseSchema,
        'Could not parse the heluis enhanced transaction body. Unknown Reason.'
    );
};
