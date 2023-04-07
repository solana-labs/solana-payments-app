import { web3 } from '@project-serum/anchor';
import * as _solana_web3_js from '@solana/web3.js';
import { z } from 'zod';

declare const PayRequest: z.ZodObject<{
    receiver: z.ZodEffects<z.ZodString, _solana_web3_js.PublicKey, string>;
    sender: z.ZodEffects<z.ZodString, _solana_web3_js.PublicKey, string>;
    sendingToken: z.ZodEffects<z.ZodString, _solana_web3_js.PublicKey, string>;
    receivingToken: z.ZodEffects<z.ZodString, _solana_web3_js.PublicKey, string>;
    feePayer: z.ZodEffects<z.ZodString, _solana_web3_js.PublicKey, string>;
    receivingAmount: z.ZodNumber;
    amountType: z.ZodNativeEnum<{
        readonly Size: "size";
        readonly Quantity: "quantity";
    }>;
    transactionType: z.ZodNativeEnum<{
        readonly Blockhash: "blockhash";
        readonly Nonce: "nonce";
    }>;
    createAta: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    receiver: _solana_web3_js.PublicKey;
    sender: _solana_web3_js.PublicKey;
    sendingToken: _solana_web3_js.PublicKey;
    receivingToken: _solana_web3_js.PublicKey;
    feePayer: _solana_web3_js.PublicKey;
    receivingAmount: number;
    amountType: "size" | "quantity";
    transactionType: "blockhash" | "nonce";
    createAta: boolean;
}, {
    receiver: string;
    sender: string;
    sendingToken: string;
    receivingToken: string;
    feePayer: string;
    receivingAmount: number;
    amountType: "size" | "quantity";
    transactionType: "blockhash" | "nonce";
    createAta?: boolean | undefined;
}>;
type PayRequest = z.infer<typeof PayRequest>;

declare const createPayTransaction: (payRequest: PayRequest) => Promise<web3.Transaction>;
declare const createSamplePayRequest: () => PayRequest;

export { PayRequest, createPayTransaction, createSamplePayRequest };
