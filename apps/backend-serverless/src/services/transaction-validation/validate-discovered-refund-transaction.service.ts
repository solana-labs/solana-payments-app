import { RefundRecord } from '@prisma/client';
import { USDC_MINT } from '../../configs/tokens.config.js';
import { web3 } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, decodeTransferCheckedInstruction } from '@solana/spl-token';
import {
    verifyAppCreatedTheHeliusEnhancedTransaction,
    verifyAppCreatedTheTransaction,
    verifySingleUseInstruction,
} from './validate-discovered-payment-transaction.service.js';
import { HeliusEnhancedTransaction } from '../../models/dependencies/helius-enhanced-transaction.model.js';

export const verifyRefundTransactionWithRefundRecord = (
    refundRecord: RefundRecord,
    transaction: web3.Transaction,
    weShouldHaveSigned: boolean
) => {
    if (weShouldHaveSigned) {
        verifyAppCreatedTheTransaction(transaction);
    }

    verifySingleUseInstruction(transaction);

    verifyTransferInstructionIsCorrect(transaction, refundRecord);
};

export const verifyRefundRecordWithHeliusEnhancedTransaction = (
    refundRecord: RefundRecord,
    transaction: HeliusEnhancedTransaction,
    weShouldHaveSigned: boolean
) => {
    if (weShouldHaveSigned) {
        verifyAppCreatedTheHeliusEnhancedTransaction(transaction);
    }
    // verifySingleUseInstructionWithHeliusEnhancedTransaction(transaction);
    verifyTransferInstructionIsCorrectWithHeliusEnhancedTransaction(transaction, refundRecord);
};

export const verifyTransferInstructionIsCorrect = (transaction: web3.Transaction, refundRecord: RefundRecord) => {
    // The token transfer is the second to last instruction included. We should check it's spot and that the
    // amount is correct.

    const instructions = transaction.instructions;
    const transferInstruction = instructions[instructions.length - 2];

    if (transferInstruction.programId.toBase58() != TOKEN_PROGRAM_ID.toBase58()) {
        throw new Error('The token transfer instruction was not in the correct position.');
    }

    const decodedTransferCheckedInstruction = decodeTransferCheckedInstruction(transferInstruction, TOKEN_PROGRAM_ID);
    const mint = decodedTransferCheckedInstruction.keys.mint.pubkey;

    if (mint.toBase58() != USDC_MINT.toBase58()) {
        throw new Error('The token transfer instruction was not for USDC');
    }

    if (decodedTransferCheckedInstruction.data.decimals != 6) {
        throw new Error('The token transfer instruction was not for USDC');
    }

    const decodedTransferQuantity = decodedTransferCheckedInstruction.data.amount;

    const refundRecordUsdcSize = refundRecord.usdcAmount;
    const refundRecordUsdcQuantity = refundRecordUsdcSize * 10 ** 6;

    if (Number(decodedTransferQuantity) !== refundRecordUsdcQuantity) {
        throw new Error('The token transfer instruction was not for the correct amount of USDC');
    }
};

export const verifyTransferInstructionIsCorrectWithHeliusEnhancedTransaction = (
    transaction: HeliusEnhancedTransaction,
    refundRecord: RefundRecord
) => {
    // The token transfer is the second to last instruction included. We should check it's spot and that the
    // amount is correct.

    const instructions = transaction.instructions;
    const transferInstruction = instructions[instructions.length - 2];

    if (transferInstruction.programId != TOKEN_PROGRAM_ID.toBase58()) {
        throw new Error(transferInstruction.programId);
    }

    // TODO: Figure out how to go from HeliusEnhancedTransaction to TransactionInstruction
    // const decodedTransferCheckedInstruction = decodeTransferCheckedInstruction(transferInstruction, TOKEN_PROGRAM_ID);
    // const mint = decodedTransferCheckedInstruction.keys.mint.pubkey;

    // if (mint.toBase58() != USDC_MINT.toBase58()) {
    //     throw new Error('The token transfer instruction was not for USDC');
    // }

    // if (decodedTransferCheckedInstruction.data.decimals != 6) {
    //     throw new Error('The token transfer instruction was not for USDC');
    // }

    // const decodedTransferQuantity = decodedTransferCheckedInstruction.data.amount;

    // const paymentRecordUsdcSize = paymentRecord.usdcAmount;
    // const paymentRecordUsdcQuantity = paymentRecordUsdcSize * 10 ** 6;

    // if (Number(decodedTransferQuantity) !== paymentRecordUsdcQuantity) {
    //     throw new Error('The token transfer instruction was not for the correct amount of USDC');
    // }

    const transfer = transaction.tokenTransfers[0];

    if (transfer.mint != USDC_MINT.toBase58()) {
        throw new Error('The token transfer instruction was not for USDC');
    }

    if (transfer.tokenAmount != refundRecord.usdcAmount) {
        throw new Error('The token transfer instruction was not for the correct amount of USDC');
    }
};
