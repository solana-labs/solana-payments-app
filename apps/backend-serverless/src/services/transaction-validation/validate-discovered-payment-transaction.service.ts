import { PaymentRecord } from '@prisma/client';
import { USDC_MINT } from '../../configs/tokens.config.js';
import { web3 } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, decodeTransferCheckedInstruction } from '@solana/spl-token';

export const verifyPaymentTransactionWithPaymentRecord = (
    paymentRecord: PaymentRecord,
    transaction: web3.Transaction,
    weShouldHaveSigned: boolean
) => {
    if (weShouldHaveSigned) {
        verifyAppCreatedTheTransaction(transaction);
    }

    verifySingleUseInstruction(transaction);

    verifyTransferInstructionIsCorrect(transaction, paymentRecord);
};

export const verifyTransferInstructionIsCorrect = (transaction: web3.Transaction, paymentRecord: PaymentRecord) => {
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

    const paymentRecordUsdcSize = paymentRecord.usdcAmount;
    const paymentRecordUsdcQuantity = paymentRecordUsdcSize * 10 ** 6;

    if (Number(decodedTransferQuantity) !== paymentRecordUsdcQuantity) {
        throw new Error('The token transfer instruction was not for the correct amount of USDC');
    }
};

export const verifyAppCreatedTheTransaction = (transaction: web3.Transaction) => {
    // Right now were' going to verify we created the transaction by checking against our list of historical fee pays

    const feePayer = transaction.feePayer;

    if (feePayer == null) {
        throw new Error('The transaction did not have a fee payer');
    }

    if (!historicalFeePays.includes(feePayer.toBase58())) {
        throw new Error('The transaction was not created by the app');
    }
};

export const verifySingleUseInstruction = (transaction: web3.Transaction) => {
    const instructions = transaction.instructions;
    const singleUseInstruction = instructions[0];

    // Check the instruction is a system program account creation

    if (singleUseInstruction.programId.toBase58() != web3.SystemProgram.programId.toBase58()) {
        throw new Error('The single use instruction was not a system program instruction.');
    }

    const systemInstructionType = web3.SystemInstruction.decodeInstructionType(singleUseInstruction);

    if (systemInstructionType != 'Create') {
        throw new Error('The single use instruction was not a system program account creation.');
    }
};

// TODO: Is there a better way to do this?
export const historicalFeePays = ['9hBUxihyvswYSExF8s7K5SZiS3XztF3DAT7eTZ5krx4T'];
