import { PaymentRecord } from '@prisma/client';
import { HeliusEnhancedTransaction } from '../../models/helius-enhanced-transaction.model.js';
import { USDC_MINT } from '../../configs/tokens.config.js';

const TOKEN_PROGRAM_ID_STRING = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

const validatePaymentTransaction = (paymentRecord: PaymentRecord, heliusTransaction: HeliusEnhancedTransaction) => {
    // Check that we had created this transaction
    verifyTransactionWasCreatedLocally(heliusTransaction);

    // Check there was a correct amount of USDC sent
    verifySentTokenAmount(paymentRecord, heliusTransaction);

    verifyIndexKeys(paymentRecord, heliusTransaction);
};

const verifyIndexKeys = (paymentRecord: PaymentRecord, heliusTransaction: HeliusEnhancedTransaction) => {
    // The index keys are on the last instruction which is the memo program
    const instructions = heliusTransaction.instructions;
    const transferInstruction = instructions[instructions.length - 1];

    if (transferInstruction.programId != 'Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo') {
        throw new Error('The memo instruction was not in the correct position.');
    }

    const indexPubkeys = transferInstruction.accounts;

    // What is the first index key going to be?
    // Check the rest of the index keys
};

const verifySentTokenAmount = (paymentRecord: PaymentRecord, heliusTransaction: HeliusEnhancedTransaction) => {
    // The token transfer is the second to last instruction included. We should check it's spot and that the
    // amount is correct.

    const instructions = heliusTransaction.instructions;
    const transferInstruction = instructions[instructions.length - 2];

    if (transferInstruction.programId != TOKEN_PROGRAM_ID_STRING) {
        throw new Error('The token transfer instruction was not in the correct position.');
    }

    // I should probably validate the data from this instruction as well, maybe this is part of the interface
    // Not going to do it now, too much work. later.

    const tokenTransfers = heliusTransaction.tokenTransfers;

    // Right now there should only be one tokenTransfer

    if (tokenTransfers.length != 1) {
        throw new Error('There should only be one token transfer');
    }

    const tokenTransfer = tokenTransfers[0];

    if (tokenTransfer.mint != USDC_MINT.toBase58()) {
        throw new Error('We should only be sending USDC right now');
    }

    if (paymentRecord.usdcAmount != tokenTransfer.amount) {
        // This would be a problem, flag as p0
        throw new Error('The amount of USDC sent was not correct');
    }
};

// Right now we want to know that the transaction was created by us
// How we know it could change in the future which is why we're wrapping this fucntion
const verifyTransactionWasCreatedLocally = (heliusTransaction: HeliusEnhancedTransaction) => {
    verifyFeePayerIsFamiliar(heliusTransaction);
};

const verifyFeePayerIsFamiliar = (heliusTransaction: HeliusEnhancedTransaction) => {
    const feePayer = heliusTransaction.feePayer;

    if (!listOfValidFeePayers().includes(feePayer)) {
        throw new Error(`Fee payer was not valid`);
    }
};

const listOfValidFeePayers = () => {
    return ['5MkkTyjYiGN2qWgobXDxMvvQ4PxuYAk1AXKoA3i1X1kt'];
};
